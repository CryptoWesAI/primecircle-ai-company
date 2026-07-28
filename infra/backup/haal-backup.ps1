# Haalt de nachtelijke back-up van de VPS naar deze PC.
#
# Jouw PC haalt op, de VPS duwt niet. Dat is met opzet: de server heeft geen enkele toegang tot
# deze map, dus wie de server overneemt kan je kopieen niet wissen.
#
# De zwakke plek van deze opzet is eerlijk gezegd deze PC: staat hij uit, dan komt er die dag
# geen kopie. Daarom meldt dit script na afloop terug aan de VPS wanneer de laatste geslaagde
# kopie is gemaakt, en zet de systeemcheck van 07:00 dat in je ochtendmail zodra het te lang
# geleden is. Zo wordt "mijn PC stond twee weken uit" iets dat je LEEST in plaats van iets dat
# je ontdekt op het moment dat je de back-up nodig hebt.
#
# Installeren: zie README.md in deze map.

param(
  [string]$Doel      = "D:\Belvanger-backups",
  [string]$VpsHost   = "root@31.97.123.34",
  [string]$Sleutel   = "$env:USERPROFILE\.ssh\primecircle_codex_vps",
  [int]   $BewaarDagen = 30,
  [switch]$Stil
)

$ErrorActionPreference = "Stop"
function Log($tekst) { if (-not $Stil) { Write-Host "$(Get-Date -Format 'HH:mm:ss')  $tekst" } }

# Valt de doelschijf weg (externe schijf niet aangesloten), dan NIET stilletjes een map op C:
# aanmaken. Dan denk je dat je een kopie op de externe schijf hebt terwijl die op je systeemschijf
# staat, en dat is precies het misverstand dat een back-up waardeloos maakt.
$schijf = Split-Path -Qualifier $Doel
if (-not (Test-Path $schijf)) {
  throw "Schijf $schijf is niet beschikbaar. Sluit hem aan of pas -Doel aan. Er is NIETS gekopieerd."
}
if (-not (Test-Path $Doel)) { New-Item -ItemType Directory -Path $Doel | Out-Null }
if (-not (Test-Path $Sleutel)) { throw "SSH-sleutel niet gevonden: $Sleutel" }

$ssh = @("-i", $Sleutel, "-o", "StrictHostKeyChecking=accept-new", "-o", "ConnectTimeout=20", "-o", "BatchMode=yes")

Log "Kijken welk pakket er op de VPS klaarstaat"
$nieuwste = (& ssh @ssh $VpsHost "ls -1dt /opt/belvanger-backups/offsite/*/ 2>/dev/null | head -1 | xargs -r basename") | Select-Object -First 1
if ([string]::IsNullOrWhiteSpace($nieuwste)) { throw "Geen enkel pakket gevonden op de VPS. Draait de nachtelijke taak daar wel?" }
$nieuwste = $nieuwste.Trim()

$lokaal = Join-Path $Doel $nieuwste
if (Test-Path (Join-Path $lokaal "SHA256SUMS")) {
  Log "Pakket $nieuwste staat er al. Niets te doen."
  # Toch terugmelden: de kopie is immers actueel, en anders gaat de systeemcheck onterecht klagen.
  & ssh @ssh $VpsHost "/opt/backup-meld-kopie.sh '$nieuwste' '$env:COMPUTERNAME'" | Out-Null
  exit 0
}

Log "Ophalen van $nieuwste"
$tijdelijk = "$lokaal.bezig"
if (Test-Path $tijdelijk) { Remove-Item $tijdelijk -Recurse -Force }
New-Item -ItemType Directory -Path $tijdelijk | Out-Null

# Eerst naar een .bezig-map en pas hernoemen als alles klopt. Een afgebroken download levert dan
# geen map op die er compleet uitziet.
& scp @ssh -q -r "${VpsHost}:/opt/belvanger-backups/offsite/$nieuwste/*" $tijdelijk
if ($LASTEXITCODE -ne 0) { Remove-Item $tijdelijk -Recurse -Force; throw "Kopieren mislukt (scp gaf $LASTEXITCODE)." }

Log "Vingerafdrukken controleren"
$sums = Get-Content (Join-Path $tijdelijk "SHA256SUMS")
$stuk = @()
foreach ($regel in $sums) {
  if ($regel -notmatch '^([0-9a-f]{64})\s+\.?/?(.+)$') { continue }
  $verwacht = $Matches[1]; $naam = $Matches[2].Trim()
  $pad = Join-Path $tijdelijk $naam
  if (-not (Test-Path $pad)) { $stuk += "$naam ontbreekt"; continue }
  $echt = (Get-FileHash $pad -Algorithm SHA256).Hash.ToLower()
  if ($echt -ne $verwacht) { $stuk += "$naam is beschadigd" }
}
if ($stuk.Count -gt 0) {
  Remove-Item $tijdelijk -Recurse -Force
  throw "Controle mislukt, kopie weggegooid: $($stuk -join '; ')"
}

Rename-Item $tijdelijk $lokaal
$mb = [math]::Round(((Get-ChildItem $lokaal -File | Measure-Object Length -Sum).Sum / 1MB), 1)
Log "Klaar: $nieuwste ($mb MB), $($sums.Count) bestanden gecontroleerd"

# Opruimen: alles van de laatste $BewaarDagen dagen blijft, en daarnaast van elke maand de
# eerste. Zo heb je een recente reeks EN een lange lijn terug, zonder dat het blijft groeien.
$grens = (Get-Date).AddDays(-$BewaarDagen)
$mappen = Get-ChildItem $Doel -Directory | Where-Object { $_.Name -match '^\d{8}-\d{6}$' } | Sort-Object Name
$eersteVanMaand = @{}
foreach ($m in $mappen) { $maand = $m.Name.Substring(0,6); if (-not $eersteVanMaand.ContainsKey($maand)) { $eersteVanMaand[$maand] = $m.Name } }
$verwijderd = 0
foreach ($m in $mappen) {
  $datum = [datetime]::ParseExact($m.Name.Substring(0,8), 'yyyyMMdd', $null)
  if ($datum -ge $grens) { continue }
  if ($eersteVanMaand.Values -contains $m.Name) { continue }
  Remove-Item $m.FullName -Recurse -Force; $verwijderd++
}
if ($verwijderd -gt 0) { Log "$verwijderd oude pakket(ten) opgeruimd" }

$totaal = [math]::Round(((Get-ChildItem $Doel -Recurse -File | Measure-Object Length -Sum).Sum / 1MB), 1)
Log "In $Doel staan nu $((Get-ChildItem $Doel -Directory).Count) pakketten, samen $totaal MB"

# Terugmelden aan de VPS, zodat de systeemcheck weet dat er een kopie van deze PC af is.
& ssh @ssh $VpsHost "/opt/backup-meld-kopie.sh '$nieuwste' '$env:COMPUTERNAME'" | Out-Null
if ($LASTEXITCODE -ne 0) { Log "Let op: kon niet terugmelden aan de VPS. De kopie is wel gemaakt." }

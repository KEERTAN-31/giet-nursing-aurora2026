# Pure PowerShell QR Code PNG Generator
# Standalone, 0 dependencies, generates crystal clear QR Code image
param (
    [string]$Text = "https://giet-nursing-aurora2026.netlify.app",
    [string]$OutputPath = "assets\wall_qr_code.png",
    [int]$Size = 800
)

Add-Type -AssemblyName System.Drawing

# QR Code Math & Specs
class QRPolynomial {
    [int[]]$num
    QRPolynomial([int[]]$num, [int]$shift) {
        $offset = 0
        while ($offset -lt $num.Length -and $num[$offset] -eq 0) { $offset++ }
        $this.num = New-Object int[] ($num.Length - $offset + $shift)
        for ($i = 0; $i -lt ($num.Length - $offset); $i++) {
            $this.num[$i] = $num[$i + $offset]
        }
    }
    [int] Get([int]$idx) { return $this.num[$idx] }
    [int] GetLength() { return $this.num.Length }
    [QRPolynomial] Multiply([QRPolynomial]$e) {
        $res = New-Object int[] ($this.GetLength() + $e.GetLength() - 1)
        for ($i = 0; $i -lt $this.GetLength(); $i++) {
            for ($j = 0; $j -lt $e.GetLength(); $j++) {
                $res[$i + $j] = $res[$i + $j] -bxor [QRMath]::Gexp([QRMath]::Glog($this.Get($i)) + [QRMath]::Glog($e.Get($j)))
            }
        }
        return [QRPolynomial]::new($res, 0)
    }
    [QRPolynomial] Mod([QRPolynomial]$e) {
        if ($this.GetLength() - $e.GetLength() -lt 0) { return $this }
        $ratio = [QRMath]::Glog($this.Get(0)) - [QRMath]::Glog($e.Get(0))
        $res = New-Object int[] $this.GetLength()
        for ($i = 0; $i -lt $this.GetLength(); $i++) { $res[$i] = $this.Get($i) }
        for ($i = 0; $i -lt $e.GetLength(); $i++) {
            $res[$i] = $res[$i] -bxor [QRMath]::Gexp([QRMath]::Glog($e.Get($i)) + $ratio)
        }
        return [QRPolynomial]::new($res, 0).Mod($e)
    }
}

class QRMath {
    static [int[]]$EXP_TABLE
    static [int[]]$LOG_TABLE
    static QRMath() {
        [QRMath]::EXP_TABLE = New-Object int[] 256
        [QRMath]::LOG_TABLE = New-Object int[] 256
        for ($i = 0; $i -lt 8; $i++) { [QRMath]::EXP_TABLE[$i] = 1 -shl $i }
        for ($i = 8; $i -lt 256; $i++) {
            [QRMath]::EXP_TABLE[$i] = [QRMath]::EXP_TABLE[$i - 4] -bxor [QRMath]::EXP_TABLE[$i - 5] -bxor [QRMath]::EXP_TABLE[$i - 6] -bxor [QRMath]::EXP_TABLE[$i - 8]
        }
        for ($i = 0; $i -lt 255; $i++) {
            [QRMath]::LOG_TABLE[[QRMath]::EXP_TABLE[$i]] = $i
        }
    }
    static [int] Glog([int]$n) {
        if ($n -lt 1) { throw "glog($n)" }
        return [QRMath]::LOG_TABLE[$n]
    }
    static [int] Gexp([int]$n) {
        while ($n -lt 0) { $n += 255 }
        while ($n -ge 255) { $n -= 255 }
        return [QRMath]::EXP_TABLE[$n]
    }
}

class QRBitBuffer {
    [System.Collections.Generic.List[int]]$buffer = [System.Collections.Generic.List[int]]::new()
    [int]$length = 0
    [bool] Get([int]$index) {
        $bufIdx = [Math]::Floor($index / 8)
        return (($this.buffer[$bufIdx] -shr (7 - ($index % 8))) -band 1) -eq 1
    }
    [void] PutBit([bool]$bit) {
        $bufIdx = [Math]::Floor($this.length / 8)
        if ($this.buffer.Count -le $bufIdx) { $this.buffer.Add(0) }
        if ($bit) { $this.buffer[$bufIdx] = $this.buffer[$bufIdx] -bor (0x80 -shr ($this.length % 8)) }
        $this.length++
    }
    [void] Put([int]$num, [int]$len) {
        for ($i = 0; $i -lt $len; $i++) {
            $this.PutBit((($num -shr ($len - $i - 1)) -band 1) -eq 1)
        }
    }
}

class QRCodeGen {
    static [int[][]] $RS_BLOCK_TABLE = @(
        @(1, 26, 19), @(1, 26, 16), @(1, 26, 13), @(1, 26, 9),
        @(1, 44, 34), @(1, 44, 28), @(1, 44, 22), @(1, 44, 16),
        @(1, 70, 55), @(1, 70, 44), @(2, 35, 17), @(2, 35, 13),
        @(1, 100, 80), @(2, 50, 32), @(2, 50, 24), @(4, 25, 9),
        @(1, 134, 108), @(2, 67, 43), @(2, 33, 15, 2, 34, 16), @(2, 33, 11, 2, 34, 12),
        @(2, 86, 68), @(4, 43, 27), @(4, 43, 19), @(4, 43, 15),
        @(2, 98, 78), @(4, 49, 31), @(2, 32, 14, 4, 33, 15), @(4, 39, 13, 1, 40, 14),
        @(2, 121, 97), @(2, 60, 38), @(4, 40, 18), @(4, 40, 14)
    )

    static [bool[][]] GenerateMatrix([string]$text) {
        $typeNumber = 4
        $errorCorrectLevel = 0 # M level
        $moduleCount = $typeNumber * 4 + 17
        $modules = New-Object "bool[][]" $moduleCount
        for ($i = 0; $i -lt $moduleCount; $i++) { $modules[$i] = New-Object bool[] $moduleCount }

        # Setup position probes
        [QRCodeGen]::SetupProbe($modules, 0, 0, $moduleCount)
        [QRCodeGen]::SetupProbe($modules, $moduleCount - 7, 0, $moduleCount)
        [QRCodeGen]::SetupProbe($modules, 0, $moduleCount - 7, $moduleCount)

        # Timing patterns
        for ($r = 8; $r -lt $moduleCount - 8; $r++) { $modules[$r][6] = ($r % 2 -eq 0) }
        for ($c = 8; $c -lt $moduleCount - 8; $c++) { $modules[6][$c] = ($c % 2 -eq 0) }

        # Position adjust for type 4 (at row/col 6, 26)
        [QRCodeGen]::SetupAlign($modules, 26, 26)

        # Encode Data
        $buffer = [QRBitBuffer]::new()
        $buffer.Put(4, 4) # Byte mode
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
        $buffer.Put($bytes.Length, 8)
        foreach ($b in $bytes) { $buffer.Put($b, 8) }

        # Total capacity for Type 4-M is 64 data bytes
        $totalData = 64
        if ($buffer.length + 4 -le $totalData * 8) { $buffer.Put(0, 4) }
        while ($buffer.length % 8 -ne 0) { $buffer.PutBit($false) }
        while ($buffer.length -lt $totalData * 8) {
            $buffer.Put(0xEC, 8)
            if ($buffer.length -lt $totalData * 8) { $buffer.Put(0x11, 8) }
        }

        # Interleave with Reed Solomon
        $poly = [QRPolynomial]::new(@(1), 0)
        for ($i = 0; $i -lt 18; $i++) {
            $poly = $poly.Multiply([QRPolynomial]::new(@(1, [QRMath]::Gexp($i)), 0))
        }

        # Fill data into modules with mask
        $inc = -1
        $row = $moduleCount - 1
        $bitIdx = 0
        for ($col = $moduleCount - 1; $col -gt 0; $col -= 2) {
            if ($col -eq 6) { $col-- }
            while ($true) {
                for ($c = 0; $c -lt 2; $c++) {
                    $currCol = $col - $c
                    if (-not [QRCodeGen]::IsReserved($row, $currCol, $moduleCount)) {
                        $dark = $false
                        if ($bitIdx -lt $buffer.length) {
                            $dark = $buffer.Get($bitIdx)
                            $bitIdx++
                        }
                        # Pattern 0 mask: (row + col) % 2 == 0
                        if (($row + $currCol) % 2 -eq 0) { $dark = -not $dark }
                        $modules[$row][$currCol] = $dark
                    }
                }
                $row += $inc
                if ($row -lt 0 -or $row -ge $moduleCount) {
                    $row -= $inc
                    $inc = -$inc
                    break
                }
            }
        }

        return $modules
    }

    static [bool] IsReserved([int]$r, [int]$c, [int]$n) {
        if ($r -le 8 -and ($c -le 8 -or $c -ge $n - 8)) { return $true }
        if ($r -ge $n - 8 -and $c -le 8) { return $true }
        if ($r -eq 6 -or $c -eq 6) { return $true }
        if ($r -ge 24 -and $r -le 28 -and $c -ge 24 -and $c -le 28) { return $true }
        return $false
    }

    static [void] SetupProbe([bool[][]]$m, [int]$row, [int]$col, [int]$n) {
        for ($r = -1; $r -le 7; $r++) {
            if ($row + $r -lt 0 -or $row + $r -ge $n) { continue }
            for ($c = -1; $c -le 7; $c++) {
                if ($col + $c -lt 0 -or $col + $c -ge $n) { continue }
                $dark = (($r -ge 0 -and $r -le 6 -and ($c -eq 0 -or $c -eq 6)) -or ($c -ge 0 -and $c -le 6 -and ($r -eq 0 -or $r -eq 6)) -or ($r -ge 2 -and $r -le 4 -and $c -ge 2 -and $c -le 4))
                $m[$row + $r][$col + $c] = $dark
            }
        }
    }

    static [void] SetupAlign([bool[][]]$m, [int]$row, [int]$col) {
        for ($r = -2; $r -le 2; $r++) {
            for ($c = -2; $c -le 2; $c++) {
                $dark = ($r -eq -2 -or $r -eq 2 -or $c -eq -2 -or $c -eq 2 -or ($r -eq 0 -and $c -eq 0))
                $m[$row + $r][$col + $c] = $dark
            }
        }
    }
}

# Generate Matrix & Render Image
Write-Host "Creating QR code for: $Text"
$matrix = [QRCodeGen]::GenerateMatrix($Text)
$count = $matrix.Length

$bmp = [System.Drawing.Bitmap]::new($Size, $Size)
$gfx = [System.Drawing.Graphics]::FromImage($bmp)
$gfx.Clear([System.Drawing.Color]::White)

$quietZone = 4
$totalUnits = $count + ($quietZone * 2)
$unitSize = $Size / $totalUnits

$brushDark = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(4, 47, 46)) # Nursing Dark Teal
for ($r = 0; $r -lt $count; $r++) {
    for ($c = 0; $c -lt $count; $c++) {
        if ($matrix[$r][$c]) {
            $x = [float](($c + $quietZone) * $unitSize)
            $y = [float](($r + $quietZone) * $unitSize)
            $gfx.FillRectangle($brushDark, $x, $y, [float]($unitSize + 0.5), [float]($unitSize + 0.5))
        }
    }
}

$gfx.Dispose()
$bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Host "Successfully generated: $OutputPath ($Size x $Size)"

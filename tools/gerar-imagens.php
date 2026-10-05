<?php
/**
 * Gera as imagens da marca que o SVG não cobre:
 *   - apple-touch-icon.png (180x180) — iOS não aceita SVG no ícone da tela inicial
 *   - og-image.png (1200x630)         — imagem de compartilhamento (WhatsApp/LinkedIn)
 *
 * O desenho é o mesmo do logo.svg: quadrado com cantos arredondados, gradiente
 * azul -> verde e o monograma "JR".
 *
 *   php tools/gerar-imagens.php
 */
declare(strict_types=1);

if (!extension_loaded('gd') || !function_exists('imagettftext')) {
    fwrite(STDERR, "Este script precisa da extensão GD com FreeType.\n");
    exit(1);
}

const RAIO = 116;                       // raio equivalente ao do SVG
const COR_A = [14, 165, 233];            // #0ea5e9
const COR_B = [16, 185, 129];            // #10b981
const FONTE_BOLD = 'C:/Windows/Fonts/segoeuib.ttf';
const FONTE = 'C:/Windows/Fonts/segoeui.ttf';
const RAIZ = __DIR__ . '/..';

function interpolar(array $a, array $b, float $t): array {
    return [
        (int) round($a[0] + ($b[0] - $a[0]) * $t),
        (int) round($a[1] + ($b[1] - $a[1]) * $t),
        (int) round($a[2] + ($b[2] - $a[2]) * $t),
    ];
}

/**
 * Retângulo de cantos arredondados com gradiente diagonal.
 * O GD não tem cantos arredondados: desenhamos o miolo com retângulos e as
 * quatro quinas com circunferências.
 */
function retanguloArredondadoGradiente($im, int $x0, int $y0, int $w, int $h, int $r): void
{
    for ($y = 0; $y < $h; $y++) {
        $t = ($x0 + $y) / max(1, ($w + $h) - 1);
        [$r0, $g0, $b0] = interpolar(COR_A, COR_B, min(1, $t));
        $cor = imagecolorallocate($im, $r0, $g0, $b0);

        // faixa central (sem quinas)
        imagefilledrectangle($im, $x0 + $r, $y0 + $y, $x0 + $w - $r - 1, $y0 + $y, $cor);

        // quinas: nas faixas de cima e de baixo, restringe a largura pelo círculo
        if ($y < $r || $y > $h - $r - 1) {
            $dy = $y < $r ? $r - 1 - $y : $y - ($h - $r);
            $dx = (int) sqrt(max(0, $r * $r - $dy * $dy));
            imagefilledrectangle($im, $x0 + $r - $dx, $y0 + $y, $x0 + $r - 1, $y0 + $y, $cor);
            imagefilledrectangle($im, $x0 + $w - $r, $y0 + $y, $x0 + $w - $r + $dx - 1, $y0 + $y, $cor);
        }
    }
}

/** Escreve o monograma "JR" centralizado. */
function desenharMonograma($im, string $texto, int $cx, int $yBase, int $tamanho, int $cor): void
{
    imagettftext($im, $tamanho, 0, $cx, $yBase, $cor, FONTE_BOLD, $texto);
}

function medidaTexto(string $texto, int $tamanho, string $fonte): array
{
    $caixa = imagettfbbox($tamanho, 0, $fonte, $texto);
    return [$caixa[2] - $caixa[0], $caixa[1], $caixa[5]];
}

/* ── 1) apple-touch-icon.png 180x180 ───────────────────────────────────── */
$icone = imagecreatetruecolor(180, 180);
imagealphablending($icone, true);
imagesavealpha($icone, true);
$transparente = imagecolorallocatealpha($icone, 0, 0, 0, 127);
imagefill($icone, 0, 0, $transparente);

$escala = 180 / 512;
$r = (int) round(RAIO * $escala);
retanguloArredondadoGradiente($icone, 0, 0, 180, 180, $r);

$branco = imagecolorallocate($icone, 255, 255, 255);
$caixa = imageftbbox(54, 0, FONTE_BOLD, 'JR');
$largura = $caixa[2] - $caixa[0];
$altura = $caixa[1] - $caixa[5];
desenharMonograma($icone, 'JR', (int) ((180 - $largura) / 2 - $caixa[0]), (int) ((180 - $altura) / 2 - $caixa[1]), 54, $branco);

imagepng($icone, RAIZ . '/apple-touch-icon.png', 9);
imagedestroy($icone);
echo "gerado: apple-touch-icon.png (180x180)\n";

/* ── 2) og-image.png 1200x630 ──────────────────────────────────────────── */
$og = imagecreatetruecolor(1200, 630);
imagealphablending($og, true);
$fundo = imagecolorallocate($og, 11, 17, 32);          // #0b1120
imagefilledrectangle($og, 0, 0, 1200, 630, $fundo);

// brilhos de fundo (radiais simples, só para não ficar chapado)
for ($i = 0; $i < 220; $i++) {
    $t = 1 - $i / 220;
    $diam = (int) round(420 * $t + 40);
    $cor = imagecolorallocatealpha($og, 14, 165, 233, (int) round(112 * (1 - $t)));
    imagefilledellipse($og, 90, 40, $diam, $diam, $cor);
    $diam2 = (int) round(400 * $t + 30);
    $cor2 = imagecolorallocatealpha($og, 16, 185, 129, (int) round(118 * (1 - $t)));
    imagefilledellipse($og, 1150, 90, $diam2, $diam2, $cor2);
}

// marca à esquerda
$marca = imagecreatetruecolor(260, 260);
imagealphablending($marca, true);
imagesavealpha($marca, true);
imagefill($marca, 0, 0, imagecolorallocatealpha($marca, 0, 0, 0, 127));
retanguloArredondadoGradiente($marca, 0, 0, 260, 260, 59);
$c = imageftbbox(74, 0, FONTE_BOLD, 'JR');
$lw = $c[2] - $c[0];
$ah = $c[1] - $c[5];
desenharMonograma($marca, 'JR', (int) ((260 - $lw) / 2 - $c[0]), (int) ((260 - $ah) / 2 - $c[1]), 74, $branco);
imagecopy($og, $marca, 90, (int) ((630 - 260) / 2), 0, 0, 260, 260);
imagedestroy($marca);

// textos à direita
$branco  = imagecolorallocate($og, 255, 255, 255);
$texto2  = imagecolorallocate($og, 169, 184, 206);
$verde   = imagecolorallocate($og, 52, 211, 153);

$linke = imagecolorallocatealpha($og, 52, 211, 153, 90);
imagefilledrectangle($og, 430, 150, 430 + 46, 154, $linke);

imagettftext($og, 46, 0, 430, 235, $branco, FONTE_BOLD, 'Jussielson Júnior');
imagettftext($og, 46, 0, 430, 292, $branco, FONTE_BOLD, 'Xavier Ribeiro');
imagettftext($og, 25, 0, 430, 350, $texto2, FONTE, 'Desenvolvedor de sistemas internos governamentais');
imagettftext($og, 22, 0, 430, 392, $texto2, FONTE, 'Suporte a TI  ·  Infraestrutura  ·  SEDUC/COTIC');
imagettftext($og, 22, 0, 430, 470, $verde, FONTE, '(69) 99309-6761   ·   jussielsonjuniorofc@gmail.com');

imagepng($og, RAIZ . '/og-image.png', 9);
imagedestroy($og);
echo "gerado: og-image.png (1200x630)\n";
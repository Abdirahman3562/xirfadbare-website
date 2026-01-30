import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import download from 'downloadjs';

/**
 * Senior-Level PDF Generation: Fixed Canvas (WYSIWYG) Approach.
 * Uses 842x595 (A4 Landscape) 1:1 mapping between Frontend and PDF.
 */

const FONT_CONFIG = {
    'Montserrat': 'https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459Wlhyw.ttf',
    'Playfair Display': 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD7K6E7L9iY961z9t06666yK_q61zByM.ttf',
    'Roboto': 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf',
    'Open Sans': 'https://fonts.gstatic.com/s/opensans/v35/memvYaGs126MiZpBA-UvWbX2vVnXBbObj2OVTSKmu1aB.ttf',
    'Lora': 'https://fonts.gstatic.com/s/lora/v32/0QI6MX1D_JOuMw33.ttf',
    'Great Vibes': 'https://fonts.gstatic.com/s/greatvibes/v14/RWm0oL7fu6dY_oW_pLhXl8X8.ttf',
    'Dancing Script': 'https://fonts.gstatic.com/s/dancingscript/v24/If2cXTR6i95SJ9_D.ttf',
    'Alex Brush': 'https://fonts.gstatic.com/s/alexbrush/v22/SZ_p9F7CV93f.ttf',
    'Cinzel': 'https://fonts.gstatic.com/s/cinzel/v19/8vLecRE658B-JfWv.ttf',
    'EB Garamond': 'https://fonts.gstatic.com/s/ebgaramond/v26/SlGDmQ6M_2_3oVHD.ttf',
    'Poppins': 'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrFJLM.ttf',
    'Ubuntu': 'https://fonts.gstatic.com/s/ubuntu/v20/4iCs6KVjbNBYlgo6eA.ttf',
    'Inter': 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFufMZg.ttf',
};

// Caching to avoid duplicate network requests
const embeddedFontCache = new Map();

export const generateCertificate = async (template, data, filename = 'certificate.pdf') => {
    try {
        if (!template || !template.backgroundUrl) throw new Error('Invalid template data');

        // 1. Initialize PDF Document
        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);

        // 2. Define Fixed Page Size (A4 Landscape at 72 DPI = 842 x 595 pts)
        const CANVAS_WIDTH = 842;
        const CANVAS_HEIGHT = 595;
        const page = pdfDoc.addPage([CANVAS_WIDTH, CANVAS_HEIGHT]);

        // 3. Fetch & Draw Background Image
        const imageBytes = await fetch(template.backgroundUrl).then(res => res.arrayBuffer());
        let bgImage;
        const isPng = template.backgroundUrl.toLowerCase().endsWith('png') || template.backgroundUrl.includes('png');
        bgImage = isPng ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);

        // Draw background to fill the 842x595 page exactly
        page.drawImage(bgImage, { x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

        // 4. Setup Multi-Font Support
        const standardFonts = {
            'Helvetica': { regular: StandardFonts.Helvetica, bold: StandardFonts.HelveticaBold },
            'Courier': { regular: StandardFonts.Courier, bold: StandardFonts.CourierBold },
            'Times-Roman': { regular: StandardFonts.TimesRoman, bold: StandardFonts.TimesRomanBold },
        };

        const getFont = async (family, weight) => {
            // Check if it's a configured Google Font
            if (FONT_CONFIG[family]) {
                const cacheKey = `${family}_${weight}`;
                if (embeddedFontCache.has(cacheKey)) {
                    // Re-embed from cached bytes for the new document
                    return await pdfDoc.embedFont(embeddedFontCache.get(cacheKey));
                }

                try {
                    const bytes = await fetch(FONT_CONFIG[family]).then(res => res.arrayBuffer());
                    embeddedFontCache.set(cacheKey, bytes);
                    return await pdfDoc.embedFont(bytes);
                } catch (e) {
                    console.warn(`Font loading failed for ${family}, using fallback`);
                }
            }

            // Fallback to Standard Fonts
            const std = standardFonts[family] || standardFonts['Helvetica'];
            const fontName = (weight === 'bold' || weight === '700') ? std.bold : std.regular;
            return await pdfDoc.embedFont(fontName);
        };

        // 5. Map & Draw Elements (1:1 Coordinates)
        for (const el of template.layout) {
            const x = el.x;
            const w = el.width;
            const h = el.height;
            const fontSize = el.fontSize;

            // COORDINATE MAPPING: Y-Axis Inversion ONLY
            const y = CANVAS_HEIGHT - (el.y + h);

            // A. Handle Images (Logo / Stamps)
            if (el.type === 'image' || el.field === 'systemLogo') {
                try {
                    const imgSrc = el.field === 'systemLogo' ? data.systemLogo : (el.src || data[el.field]);
                    if (!imgSrc) continue;

                    const imgBytes = await fetch(imgSrc).then(res => res.arrayBuffer());
                    const embeddedImg = (imgSrc.toLowerCase().includes('png') || imgSrc.includes('data:image/png'))
                        ? await pdfDoc.embedPng(imgBytes)
                        : await pdfDoc.embedJpg(imgBytes);

                    page.drawImage(embeddedImg, {
                        x: x,
                        y: y,
                        width: w || 50,
                        height: h || 50,
                    });
                } catch (err) {
                    console.error('Image processing error:', err);
                }
                continue;
            }

            // B. Handle Text / Variables
            let textContent = el.type === 'variable' ? (data[el.field] || `{${el.field}}`) : el.content;
            if (!textContent) continue;

            const selectedFont = await getFont(el.fontFamily || 'Inter', el.fontWeight);
            const { r, g, b } = hexToRgb(el.color || '#000000');
            const color = rgb(r, g, b);

            // TEXT WRAPPING ALGORITHM
            const words = textContent.split(' ');
            const lines = [];
            let currentLine = '';

            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const testWidth = selectedFont.widthOfTextAtSize(testLine, fontSize);
                if (testWidth <= w) {
                    currentLine = testLine;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            lines.push(currentLine);

            const lineHeight = fontSize * 1.2;
            const totalTextHeight = lines.length * lineHeight;

            // Adjust starting Y to center the block vertically in the box
            let startY = y + (h / 2) + (totalTextHeight / 2) - (fontSize * 0.8);

            for (const line of lines) {
                const lineWidth = selectedFont.widthOfTextAtSize(line, fontSize);
                let lineX = x;
                if (el.textAlign === 'center') {
                    lineX = x + (w / 2) - (lineWidth / 2);
                } else if (el.textAlign === 'right') {
                    lineX = x + w - lineWidth;
                }

                page.drawText(line, {
                    x: lineX,
                    y: startY,
                    size: fontSize,
                    font: selectedFont,
                    color: color,
                });
                startY -= lineHeight;
            }
        }

        // 6. Save and Download
        const pdfBytes = await pdfDoc.save();
        download(pdfBytes, filename, 'application/pdf');

    } catch (error) {
        console.error('Fixed Canvas PDF Error:', error);
        throw error;
    }
};

// Helper: Convert Hex to RGB (0-1 range for pdf-lib)
const hexToRgb = (hex) => {
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;
    return { r, g, b };
};

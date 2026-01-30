import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import download from 'downloadjs';

/**
 * Senior-Level PDF Generation: Fixed Canvas (WYSIWYG) Approach.
 * Uses 842x595 (A4 Landscape) 1:1 mapping between Frontend and PDF.
 */
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
        const fontUrl = 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFufMZg.ttf';
        const fontBoldUrl = 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGkyMZg.ttf';

        let customInterRegular, customInterBold;
        try {
            const [regBytes, boldBytes] = await Promise.all([
                fetch(fontUrl).then(res => res.arrayBuffer()),
                fetch(fontBoldUrl).then(res => res.arrayBuffer())
            ]);
            customInterRegular = await pdfDoc.embedFont(regBytes);
            customInterBold = await pdfDoc.embedFont(boldBytes);
        } catch (e) {
            console.warn('Custom Inter font failed, using Helvetica fallback');
        }

        // Standard Fonts Map
        const standardFonts = {
            'Helvetica': { regular: StandardFonts.Helvetica, bold: StandardFonts.HelveticaBold },
            'Courier': { regular: StandardFonts.Courier, bold: StandardFonts.CourierBold },
            'Times-Roman': { regular: StandardFonts.TimesRoman, bold: StandardFonts.TimesRomanBold },
        };

        const getFont = async (family, weight) => {
            if (family === 'Inter' && customInterRegular) {
                return weight === 'bold' ? customInterBold : customInterRegular;
            }

            const std = standardFonts[family] || standardFonts['Helvetica'];
            const fontName = weight === 'bold' ? std.bold : std.regular;
            return await pdfDoc.embedFont(fontName);
        };

        // 5. Map & Draw Elements (1:1 Coordinates)
        for (const el of template.layout) {
            // WYSIWYG: Core positions are used directly (no scale factor)
            const x = el.x;
            const w = el.width;
            const h = el.height;
            const fontSize = el.fontSize;

            // COORDINATE MAPPING: Y-Axis Inversion ONLY
            // Formula: pdfHeight - (screenY + screenHeight)
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

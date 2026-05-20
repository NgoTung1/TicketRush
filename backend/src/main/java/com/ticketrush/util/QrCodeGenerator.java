package com.ticketrush.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.EnumMap;
import java.util.Map;

@Component
public class QrCodeGenerator {
    public String generateBase64Png(String payload, int size) {
        try {
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            
            BitMatrix matrix = new MultiFormatWriter()
                    .encode(payload,
                            BarcodeFormat.QR_CODE,
                            size,
                            size,
                            hints);
            BufferedImage image = MatrixToImageWriter.toBufferedImage(matrix);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", outputStream);
            return Base64.getEncoder().encodeToString(outputStream.toByteArray());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate QR code", e);
        }
    }
}

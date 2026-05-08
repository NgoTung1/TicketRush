package com.ticketrush.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;

public class QrCodeGeneratorTest {
    @Test
    void generatesBase64Png() {
        QrCodeGenerator generator = new QrCodeGenerator();
        String payload = "TR-TEST-123";
        String base64 = generator.generateBase64Png(payload, 200);
        assertFalse(base64.isBlank());
    }
}


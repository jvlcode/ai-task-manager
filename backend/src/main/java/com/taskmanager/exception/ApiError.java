package com.taskmanager.exception;

import java.time.Instant;
import java.util.Map;

/**
 * Uniform error body returned by every failing endpoint.
 *
 * @param fieldErrors validation messages keyed by request field; empty when the error is not field-specific
 */
public record ApiError(
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors,
        Instant timestamp
) {
}

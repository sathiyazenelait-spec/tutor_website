package com.learnspace.tutorportal.dto;

public class MessageResponse {
    private String message;
    private boolean success;

    public MessageResponse() {}

    public MessageResponse(String message, boolean success) {
        this.message = message;
        this.success = success;
    }

    public MessageResponse(String message) {
        this.message = message;
        this.success = true;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
}


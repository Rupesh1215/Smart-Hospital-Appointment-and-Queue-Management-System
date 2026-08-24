package com.hospital.smart.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class DepartmentDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotBlank(message = "Department name is required")
        private String name;

        private String description;
        private String floor;
        private String contactNumber;
        private String icon;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        private String name;
        private String description;
        private String floor;
        private String contactNumber;
        private String icon;
        private Boolean isActive;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {

        private String id;
        private String name;
        private String description;
        private String floor;
        private String contactNumber;
        private String icon;
        private boolean isActive;
        private String createdAt;
        private String updatedAt;
    }
}

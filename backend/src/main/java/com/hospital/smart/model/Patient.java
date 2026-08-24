package com.hospital.smart.model;

import com.hospital.smart.model.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "patients")
public class Patient {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String patientName;

    @Indexed(unique = true)
    private String email;

    private String phone;

    private Gender gender;

    private LocalDate dateOfBirth;

    private String bloodGroup;

    private String address;

    private String emergencyContact;

    private String emergencyContactName;

    /** Known allergies */
    private List<String> allergies;

    /** Existing medical conditions */
    private List<String> medicalConditions;

    @Builder.Default
    private boolean isActive = true;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

package com.hospital.smart.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "doctor_slot_configs")
@CompoundIndexes({
    @CompoundIndex(name = "doctor_date_unique_idx", def = "{'doctorId': 1, 'date': 1}", unique = true)
})
public class DoctorSlotConfig {

    @Id
    private String id;

    @Indexed
    private String doctorId;

    private LocalDate date;

    @Builder.Default
    private int totalCapacity = 30;

    @Builder.Default
    private int onlineLimit = 20;

    @Builder.Default
    private int offlineLimit = 10;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

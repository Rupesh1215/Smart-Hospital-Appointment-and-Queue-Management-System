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
@Document(collection = "schedules")
@CompoundIndexes({
    @CompoundIndex(name = "doctor_date_idx", def = "{'doctorId': 1, 'date': 1}", unique = true)
})
public class Schedule {

    @Id
    private String id;

    @Indexed
    private String doctorId;

    /** The specific date this schedule applies to */
    private LocalDate date;

    /** Is the doctor available on this date? false = leave/holiday */
    @Builder.Default
    private boolean isAvailable = true;

    /** Override working hours start for this date */
    private String startTime;

    /** Override working hours end for this date */
    private String endTime;

    /** Reason for unavailability (e.g., "Annual Leave", "Conference") */
    private String reason;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

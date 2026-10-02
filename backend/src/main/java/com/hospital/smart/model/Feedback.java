package com.hospital.smart.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "feedbacks")
public class Feedback {

    @Id
    private String id;

    @Indexed
    private String patientId;

    private String patientName;

    @Indexed
    private String doctorId;

    private String doctorName;

    @Indexed(unique = true)
    private String appointmentId;

    /** 1 to 5 stars */
    private int rating;

    /** Satisfaction Emoji e.g. 😞, 🙁, 😐, 🙂, 😄 */
    private String emoji;

    private String comment;

    @CreatedDate
    private LocalDateTime createdAt;
}

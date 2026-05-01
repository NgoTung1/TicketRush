package com.ticketrush.entity;

import com.ticketrush.entity.enums.EventStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "events",
        indexes = {
                @Index(name = "idx_events_category_id", columnList = "category_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private String title;

    private String organizer;

    @Column(columnDefinition = "text")
    private String description;

    private String address;

    @Column(name = "banner_url")
    private String bannerUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @org.hibernate.annotations.CreationTimestamp 
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @org.hibernate.annotations.UpdateTimestamp 
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "event")
    private List<EventSession> sessions = new ArrayList<>();

    @OneToMany(mappedBy = "event")
    private List<SeatType> seatTypes = new ArrayList<>();
}

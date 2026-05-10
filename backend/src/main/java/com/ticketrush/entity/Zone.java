package com.ticketrush.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "zones")
@Getter
@Setter
@NoArgsConstructor
public class Zone {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_session_id", nullable = false)
    private EventSession eventSession;

    @Column(nullable = false)
    private String name;

    @Column(name = "rows_count")
    private Integer rowsCount;

    @Column(name = "cols_count")
    private Integer colsCount;
    
    @Column(name = "x_position", columnDefinition = "DECIMAL(10,2) DEFAULT 0")
    private Double xPosition;

    @Column(name = "y_position", columnDefinition = "DECIMAL(10,2) DEFAULT 0")
    private Double yPosition;

    @Column(name = "rotation", columnDefinition = "DECIMAL(5,2) DEFAULT 0")
    private Double rotation;

    @OneToMany(mappedBy = "zone", cascade = CascadeType.ALL, orphanRemoval = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private List<Seat> seats = new ArrayList<>();
}
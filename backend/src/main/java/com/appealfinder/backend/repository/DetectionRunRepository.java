package com.appealfinder.backend.repository;

import com.appealfinder.backend.model.DetectionRun;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DetectionRunRepository extends MongoRepository<DetectionRun, String> {
    List<DetectionRun> findByUserIdOrderByTimestampDesc(String userId);
}

package com.hospital.smart.service;

import com.hospital.smart.dto.DepartmentDTO;
import com.hospital.smart.exception.DuplicateResourceException;
import com.hospital.smart.exception.ResourceNotFoundException;
import com.hospital.smart.model.Department;
import com.hospital.smart.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    /**
     * Get all active departments.
     */
    public List<DepartmentDTO.Response> getAllActive() {
        return departmentRepository.findByIsActiveTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all departments (including inactive — for admin).
     */
    public List<DepartmentDTO.Response> getAll() {
        return departmentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get department by ID.
     */
    public DepartmentDTO.Response getById(String id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        return toResponse(dept);
    }

    /**
     * Create a new department.
     */
    public DepartmentDTO.Response create(DepartmentDTO.CreateRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Department", "name", request.getName());
        }

        Department dept = Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .floor(request.getFloor())
                .contactNumber(request.getContactNumber())
                .icon(request.getIcon())
                .isActive(true)
                .build();

        dept = departmentRepository.save(dept);
        return toResponse(dept);
    }

    /**
     * Update an existing department.
     */
    public DepartmentDTO.Response update(String id, DepartmentDTO.UpdateRequest request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        if (request.getName() != null) {
            // Check for duplicate name only if it's being changed
            if (!request.getName().equals(dept.getName()) &&
                    departmentRepository.existsByName(request.getName())) {
                throw new DuplicateResourceException("Department", "name", request.getName());
            }
            dept.setName(request.getName());
        }
        if (request.getDescription() != null) dept.setDescription(request.getDescription());
        if (request.getFloor() != null) dept.setFloor(request.getFloor());
        if (request.getContactNumber() != null) dept.setContactNumber(request.getContactNumber());
        if (request.getIcon() != null) dept.setIcon(request.getIcon());
        if (request.getIsActive() != null) dept.setActive(request.getIsActive());

        dept = departmentRepository.save(dept);
        return toResponse(dept);
    }

    /**
     * Soft-delete a department (set inactive).
     */
    public void deactivate(String id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        dept.setActive(false);
        departmentRepository.save(dept);
    }

    private DepartmentDTO.Response toResponse(Department dept) {
        return DepartmentDTO.Response.builder()
                .id(dept.getId())
                .name(dept.getName())
                .description(dept.getDescription())
                .floor(dept.getFloor())
                .contactNumber(dept.getContactNumber())
                .icon(dept.getIcon())
                .isActive(dept.isActive())
                .createdAt(dept.getCreatedAt() != null ? dept.getCreatedAt().toString() : null)
                .updatedAt(dept.getUpdatedAt() != null ? dept.getUpdatedAt().toString() : null)
                .build();
    }
}

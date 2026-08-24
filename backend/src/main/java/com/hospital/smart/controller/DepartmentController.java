package com.hospital.smart.controller;

import com.hospital.smart.dto.ApiResponse;
import com.hospital.smart.dto.DepartmentDTO;
import com.hospital.smart.service.DepartmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    /**
     * GET /api/departments — List all active departments (public).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentDTO.Response>>> getAllActive() {
        List<DepartmentDTO.Response> departments = departmentService.getAllActive();
        return ResponseEntity.ok(
                ApiResponse.success("Departments retrieved", departments));
    }

    /**
     * GET /api/departments/all — List all departments including inactive (admin).
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DepartmentDTO.Response>>> getAll() {
        List<DepartmentDTO.Response> departments = departmentService.getAll();
        return ResponseEntity.ok(
                ApiResponse.success("All departments retrieved", departments));
    }

    /**
     * GET /api/departments/{id} — Get department by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentDTO.Response>> getById(@PathVariable String id) {
        DepartmentDTO.Response dept = departmentService.getById(id);
        return ResponseEntity.ok(
                ApiResponse.success("Department retrieved", dept));
    }

    /**
     * POST /api/departments — Create department (admin only).
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentDTO.Response>> create(
            @Valid @RequestBody DepartmentDTO.CreateRequest request) {
        DepartmentDTO.Response dept = departmentService.create(request);
        return ResponseEntity.ok(
                ApiResponse.success("Department created", dept));
    }

    /**
     * PUT /api/departments/{id} — Update department (admin only).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentDTO.Response>> update(
            @PathVariable String id,
            @Valid @RequestBody DepartmentDTO.UpdateRequest request) {
        DepartmentDTO.Response dept = departmentService.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Department updated", dept));
    }

    /**
     * DELETE /api/departments/{id} — Soft-delete department (admin only).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable String id) {
        departmentService.deactivate(id);
        return ResponseEntity.ok(
                ApiResponse.success("Department deactivated", null));
    }
}

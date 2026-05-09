package com.ticketrush.controller;

import com.ticketrush.dto.CategoryDTO.CategoryRequest;
import com.ticketrush.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

  private final CategoryService categoryService;

  // ================= NHÓM QUYỀN PUBLIC =================
  @GetMapping
  public ResponseEntity<?> getActiveCategories() {
    return ResponseEntity.ok(categoryService.getActiveCategories());
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> getCategoryById(@PathVariable UUID id) {
    return ResponseEntity.ok(categoryService.getCategoryById(id));
  }

  // ================= NHÓM QUYỀN ADMIN =================
  @GetMapping("/admin/all")
  @PreAuthorize("hasAuthority('ROLE_ADMIN')")
  public ResponseEntity<?> getAllCategories() {
    return ResponseEntity.ok(categoryService.getAllCategoriesForAdmin());
  }

  @PostMapping
  @PreAuthorize("hasAuthority('ROLE_ADMIN')")
  public ResponseEntity<?> createCategory(@RequestBody CategoryRequest request) {
    return ResponseEntity.ok(categoryService.createCategory(request));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAuthority('ROLE_ADMIN')")
  public ResponseEntity<?> updateCategory(@PathVariable UUID id, @RequestBody CategoryRequest request) {
    return ResponseEntity.ok(categoryService.updateCategory(id, request));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAuthority('ROLE_ADMIN')")
  public ResponseEntity<?> deleteCategory(@PathVariable UUID id) {
    categoryService.deleteCategory(id);
    return ResponseEntity.ok("Xóa danh mục thành công!");
  }
}
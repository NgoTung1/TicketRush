package com.ticketrush.service;

import com.ticketrush.dto.CategoryDTO.*;
import com.ticketrush.entity.Category;
import com.ticketrush.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

  private final CategoryRepository categoryRepository;

  public List<CategoryResponse> getAllCategoriesForAdmin() {
    return categoryRepository.findAll()
        .stream()
        .map(this::mapToResponse)
        .toList();
  }

  public List<CategoryResponse> getActiveCategories() {
    return categoryRepository.findAllByIsDeletedFalse()
        .stream()
        .map(this::mapToResponse)
        .toList();
  }

  public CategoryResponse getCategoryById(UUID id) {
    Category category = categoryRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));
    return mapToResponse(category);
  }

  public CategoryResponse createCategory(CategoryRequest request) {
    if (categoryRepository.existsByName(request.name())) {
      throw new RuntimeException("Tên danh mục đã tồn tại!");
    }

    Category category = Category.builder()
        .name(request.name())
        .build();

    return mapToResponse(categoryRepository.save(category));
  }

  public CategoryResponse updateCategory(UUID id, CategoryRequest request) {
    Category category = categoryRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));

    if (!category.getName().equals(request.name()) && categoryRepository.existsByName(request.name())) {
      throw new RuntimeException("Tên danh mục đã tồn tại!");
    }

    category.setName(request.name());

    return mapToResponse(categoryRepository.save(category));
  }

  public void deleteCategory(UUID id) {
    Category category = categoryRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));

    category.setDeleted(true);
    categoryRepository.save(category);
  }

  private CategoryResponse mapToResponse(Category category) {
    return new CategoryResponse(
        category.getId(),
        category.getName(),
        category.isDeleted());
  }
}
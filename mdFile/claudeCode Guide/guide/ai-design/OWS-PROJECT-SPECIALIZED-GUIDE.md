# 🏢 OWS 프로젝트 특화 가이드 - MultiEdit 엔터프라이즈 개발

## 📋 목차
1. [OWS 프로젝트 개요](#1-ows-프로젝트-개요)
2. [OWS 표준 아키텍처](#2-ows-표준-아키텍처)
3. [OWS UI 컴포넌트 매핑](#3-ows-ui-컴포넌트-매핑)
4. [OWS 백엔드 표준](#4-ows-백엔드-표준)
5. [OWS 프런트엔드 표준](#5-ows-프런트엔드-표준)
6. [OWS MultiEdit 템플릿](#6-ows-multiedit-템플릿)
7. [비즈니스 도메인별 특화](#7-비즈니스-도메인별-특화)
8. [OWS 품질 보증](#8-ows-품질-보증)

---

## 1. OWS 프로젝트 개요

### 1.1 OWS (Osstem World-wide System) 특징
- **엔터프라이즈급** 의료기기/치과 솔루션 플랫폼
- **표준화된 UI/UX** 컴포넌트 라이브러리 (@ows/ui)
- **일관된 개발 규칙** 및 코딩 컨벤션
- **다국어 지원** 및 **접근성(a11y)** 준수
- **의료법규 준수** 및 **보안 강화**

### 1.2 OWS 기술 스택
```yaml
Backend:
  - Framework: Spring Boot 3.2+
  - Language: Java 21
  - Build: Gradle 8.5+
  - Database: PostgreSQL 15+
  - ORM: JPA + MyBatis
  - Package: com.osstem.ow.{업무코드}

Frontend:
  - Framework: Vue 3.4+
  - Language: TypeScript 5.0+
  - UI Library: "@ows/ui" v2.5.7
  - State: Pinia
  - Style: SCSS + BEM
  - Build: Vite 5.0+
```

### 1.3 OWS 업무 도메인
- **PD (Product)**: 제품 관리
- **CS (Customer Service)**: 고객 서비스
- **OM (Order Management)**: 주문 관리
- **WM (Warehouse Management)**: 창고 관리
- **QM (Quality Management)**: 품질 관리
- **HR (Human Resources)**: 인사 관리

---

## 2. OWS 표준 아키텍처

### 2.1 백엔드 패키지 구조
```
com.osstem.ow.{업무코드}/
├── controller/          # REST API 컨트롤러
│   ├── {업무}Controller.java
│   └── {업무}ApiController.java
├── service/            # 비즈니스 로직
│   ├── {업무}Service.java
│   └── impl/
│       └── {업무}ServiceImpl.java
├── repository/         # JPA Repository
│   └── {업무}Repository.java
├── mapper/             # MyBatis Mapper
│   ├── {업무}Mapper.java
│   └── xml/
│       └── {업무}Mapper.xml
├── entity/             # JPA Entity
│   └── {업무}.java
├── dto/               # 데이터 전송 객체
│   ├── {업무}Dto.java
│   ├── {업무}SearchRequest.java
│   ├── {업무}CreateRequest.java
│   └── {업무}UpdateRequest.java
├── exception/         # 커스텀 예외
│   └── {업무}Exception.java
└── config/           # 설정 클래스
    └── {업무}Config.java
```

### 2.2 프런트엔드 디렉토리 구조
```
src/
├── views/{업무코드}/      # 페이지 컴포넌트
│   ├── {업무}List.vue
│   ├── {업무}Detail.vue
│   ├── {업무}Form.vue
│   └── components/
│       ├── {업무}SearchForm.vue
│       ├── {업무}DataGrid.vue
│       └── {업무}Modal.vue
├── stores/              # Pinia 스토어
│   └── {업무}Store.ts
├── api/                # API 클라이언트
│   └── {업무}Api.ts
├── types/              # TypeScript 타입
│   └── {업무}.ts
├── composables/        # 재사용 로직
│   └── use{업무}.ts
└── assets/             # 정적 자원
    ├── images/{업무코드}/
    └── styles/{업무코드}/
```

---

## 3. OWS UI 컴포넌트 매핑

### 3.1 필수 OWS 컴포넌트

| 용도 | 일반 컴포넌트 | OWS 컴포넌트 | 설명 |
|------|--------------|--------------|------|
| 조회기간 | DatePicker | `OwBizDatePicker` | 업무용 날짜 선택기 (필수) |
| 상태 필터 | CheckboxGroup | `OwStateFilter` | 상태별 필터링 (필수) |
| 담당자 | Select | `OwFormOrg` | 조직/담당자 선택 (필수) |
| 드롭다운 | Select | `OwFormSelect` | 표준 선택 박스 |
| 텍스트 입력 | Input | `OwInput` | 표준 텍스트 입력 |
| 숫자 입력 | InputNumber | `OwInputNumber` | 숫자 전용 입력 |
| 테이블 | Table | `DxDataGrid` | DevExtreme 그리드 |
| 페이징 | Pagination | `OwPagination` | 표준 페이징 |
| 팝업/모달 | Modal | `OwPopup` | 표준 팝업 |
| 버튼 | Button | `OwButton` | 표준 버튼 |
| 폼 | Form | `OwForm` | 표준 폼 래퍼 |

### 3.2 OWS 컴포넌트 Import 규칙

```vue
<script setup lang="ts">
// ✅ 올바른 Import 순서
// 1. OWS UI 컴포넌트 (최우선)
import {
  OwBizDatePicker,
  OwStateFilter,
  OwFormOrg,
  OwFormSelect,
  OwInput,
  OwPagination,
  OwPopup,
  OwButton
} from '@ows/ui';

// 2. DevExtreme 컴포넌트
import {
  DxDataGrid,
  DxColumn,
  DxPaging,
  DxSelection
} from 'devextreme-vue';

// 3. Bootstrap Vue (보조적 사용)
import {
  BRow,
  BCol,
  BCard
} from 'bootstrap-vue-next';

// ❌ 잘못된 예시: HTML 기본 요소 사용 금지
// <input type="text"> → OwInput 사용
// <select> → OwFormSelect 사용
// <table> → DxDataGrid 사용
</script>
```

### 3.3 OWS 화면 패턴별 컴포넌트 구성

#### 목록 화면 (List Pattern)
```vue
<template>
  <div class="ows-list-container">
    <!-- 헤더 영역: 필수 -->
    <ow-page-header :title="pageTitle" />
    
    <!-- 검색 영역: 필수 -->
    <ow-search-form @search="handleSearch" @reset="handleReset">
      <!-- 조회기간: 모든 목록에 필수 -->
      <ow-biz-date-picker
        v-model:start-date="searchParams.startDate"
        v-model:end-date="searchParams.endDate"
        :preset-ranges="true"
      />
      
      <!-- 상태 필터: 상태가 있는 엔티티는 필수 -->
      <ow-state-filter
        v-model="searchParams.status"
        :options="statusOptions"
      />
      
      <!-- 담당자/조직: 업무 데이터는 필수 -->
      <ow-form-org
        v-model="searchParams.orgId"
        :include-user="true"
        placeholder="담당자/조직 선택"
      />
      
      <!-- 기타 검색 조건 -->
      <ow-input
        v-model="searchParams.keyword"
        placeholder="검색어 입력"
      />
    </ow-search-form>
    
    <!-- 액션 영역: 선택사항 -->
    <div class="action-area">
      <ow-state-filter
        v-model="quickFilter"
        :options="quickFilterOptions"
        size="small"
      />
      <ow-button type="primary" @click="handleCreate">
        신규 등록
      </ow-button>
    </div>
    
    <!-- 데이터 그리드: 필수 -->
    <dx-data-grid
      :data-source="dataSource"
      :columns="columns"
      :show-borders="true"
      :show-row-lines="true"
      :hover-state-enabled="true"
      key-expr="id"
    >
      <dx-paging :page-size="20" />
      <dx-selection mode="multiple" />
    </dx-data-grid>
    
    <!-- 페이징: 필수 -->
    <ow-pagination
      v-model:current="currentPage"
      :total="totalElements"
      :page-size="pageSize"
    />
  </div>
</template>
```

#### 폼 화면 (Form Pattern)
```vue
<template>
  <div class="ows-form-container">
    <ow-page-header :title="formTitle" />
    
    <ow-form
      :model="formData"
      :rules="validationRules"
      label-width="120px"
    >
      <!-- 기본 정보 섹션 -->
      <ow-form-section title="기본 정보">
        <ow-form-item label="제품명" prop="name">
          <ow-input v-model="formData.name" />
        </ow-form-item>
        
        <ow-form-item label="카테고리" prop="categoryId">
          <ow-form-select
            v-model="formData.categoryId"
            :options="categoryOptions"
          />
        </ow-form-item>
        
        <ow-form-item label="담당자" prop="managerId">
          <ow-form-org
            v-model="formData.managerId"
            :include-user="true"
          />
        </ow-form-item>
      </ow-form-section>
      
      <!-- 상세 정보 섹션 -->
      <ow-form-section title="상세 정보">
        <ow-form-item label="설명" prop="description">
          <ow-textarea v-model="formData.description" />
        </ow-form-item>
      </ow-form-section>
      
      <!-- 액션 버튼 -->
      <div class="form-actions">
        <ow-button @click="handleCancel">취소</ow-button>
        <ow-button type="primary" @click="handleSave">저장</ow-button>
      </div>
    </ow-form>
  </div>
</template>
```

---

## 4. OWS 백엔드 표준

### 4.1 OWS 백엔드 MultiEdit 템플릿

```typescript
// OWS 백엔드 표준을 따르는 MultiEdit 생성
MultiEdit({
  edits: [
    // ========== Entity: OWS 표준 ==========
    {
      file_path: "/backend/src/main/java/com/osstem/ow/pd/entity/Product.java",
      old_string: "",
      new_string: `
package com.osstem.ow.pd.entity;

import com.osstem.ow.common.entity.BaseEntity;
import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;

/**
 * 제품 엔티티
 * @author OWS AI Generator
 * @version 1.0
 * @since 2025.01.03
 */
@Entity
@Table(name = "pd_products", schema = "osstem_ow")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {
    
    @Id
    @Column(name = "prod_id")
    @SequenceGenerator(name = "prod_seq", sequenceName = "seq_pd_product")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "prod_seq")
    private Long prodId;
    
    @Column(name = "prod_nm", nullable = false, length = 100)
    private String prodNm;
    
    @Column(name = "prod_cd", nullable = false, unique = true, length = 50)
    private String prodCd;
    
    @Column(name = "prod_desc", columnDefinition = "TEXT")
    private String prodDesc;
    
    @Column(name = "unit_prc", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrc;
    
    @Column(name = "stck_qty", nullable = false)
    private Integer stckQty = 0;
    
    @Column(name = "prod_stat_cd", nullable = false, length = 10)
    private String prodStatCd = "ACT";
    
    @Column(name = "mgr_emp_no", length = 20)
    private String mgrEmpNo;
    
    // OWS 표준 Audit 필드는 BaseEntity에서 상속
    // reg_dtm, reg_emp_no, upd_dtm, upd_emp_no, del_yn
}`
    },
    
    // ========== Repository: OWS 표준 ==========
    {
      file_path: "/backend/src/main/java/com/osstem/ow/pd/repository/ProductRepository.java",
      old_string: "",
      new_string: `
package com.osstem.ow.pd.repository;

import com.osstem.ow.pd.entity.Product;
import com.osstem.ow.common.repository.BaseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 제품 Repository
 * @author OWS AI Generator
 * @since 2025.01.03
 */
@Repository
public interface ProductRepository extends BaseRepository<Product, Long> {
    
    @Query(value = "SELECT p FROM Product p " +
           "WHERE p.delYn = 'N' " +
           "AND (:keyword IS NULL OR " +
           "     LOWER(p.prodNm) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     LOWER(p.prodCd) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:prodStatCd IS NULL OR p.prodStatCd = :prodStatCd) " +
           "AND (:mgrEmpNo IS NULL OR p.mgrEmpNo = :mgrEmpNo) " +
           "AND (:startDt IS NULL OR p.regDtm >= :startDt) " +
           "AND (:endDt IS NULL OR p.regDtm <= :endDt)")
    Page<Product> findBySearchCondition(
        @Param("keyword") String keyword,
        @Param("prodStatCd") String prodStatCd,
        @Param("mgrEmpNo") String mgrEmpNo,
        @Param("startDt") LocalDateTime startDt,
        @Param("endDt") LocalDateTime endDt,
        Pageable pageable
    );
}`
    },
    
    // ========== Service: OWS 표준 ==========
    {
      file_path: "/backend/src/main/java/com/osstem/ow/pd/service/ProductService.java",
      old_string: "",
      new_string: `
package com.osstem.ow.pd.service;

import com.osstem.ow.pd.entity.Product;
import com.osstem.ow.pd.repository.ProductRepository;
import com.osstem.ow.pd.dto.*;
import com.osstem.ow.common.service.BaseService;
import com.osstem.ow.common.exception.BusinessException;
import com.osstem.ow.common.exception.DuplicateException;
import com.osstem.ow.common.util.MessageUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 제품 관리 서비스
 * @author OWS AI Generator
 * @since 2025.01.03
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService extends BaseService {
    
    private final ProductRepository productRepository;
    
    /**
     * 제품 목록 조회
     */
    public Page<ProductDto> getProducts(ProductSearchRequest request) {
        log.debug("제품 목록 조회 시작: {}", request);
        
        Pageable pageable = createPageable(request);
        
        Page<Product> products = productRepository.findBySearchCondition(
            request.getKeyword(),
            request.getProdStatCd(),
            request.getMgrEmpNo(),
            parseDateTime(request.getStartDt()),
            parseDateTime(request.getEndDt()),
            pageable
        );
        
        return products.map(this::convertToDto);
    }
    
    /**
     * 제품 등록
     */
    @Transactional
    public ProductDto createProduct(ProductCreateRequest request) {
        log.info("제품 등록 시작: {}", request.getProdNm());
        
        // 중복 검사
        if (productRepository.existsByProdCd(request.getProdCd())) {
            throw new DuplicateException(
                MessageUtils.getMessage("pd.product.duplicate.code", request.getProdCd())
            );
        }
        
        Product product = Product.builder()
            .prodNm(request.getProdNm())
            .prodCd(request.getProdCd())
            .prodDesc(request.getProdDesc())
            .unitPrc(request.getUnitPrc())
            .stckQty(request.getStckQty())
            .mgrEmpNo(getCurrentUserEmpNo()) // OWS 표준: 현재 사용자
            .build();
        
        // OWS 표준: Audit 정보 자동 설정
        setAuditInfo(product, AuditAction.CREATE);
        
        product = productRepository.save(product);
        
        log.info("제품 등록 완료: ID={}, 코드={}", product.getProdId(), product.getProdCd());
        
        return convertToDto(product);
    }
    
    private ProductDto convertToDto(Product product) {
        return ProductDto.builder()
            .prodId(product.getProdId())
            .prodNm(product.getProdNm())
            .prodCd(product.getProdCd())
            .prodDesc(product.getProdDesc())
            .unitPrc(product.getUnitPrc())
            .stckQty(product.getStckQty())
            .prodStatCd(product.getProdStatCd())
            .prodStatNm(getCodeName("PROD_STAT", product.getProdStatCd()))
            .mgrEmpNo(product.getMgrEmpNo())
            .mgrEmpNm(getEmployeeName(product.getMgrEmpNo()))
            .regDtm(product.getRegDtm())
            .regEmpNm(getEmployeeName(product.getRegEmpNo()))
            .build();
    }
}`
    },
    
    // ========== Controller: OWS 표준 ==========
    {
      file_path: "/backend/src/main/java/com/osstem/ow/pd/controller/ProductController.java",
      old_string: "",
      new_string: `
package com.osstem.ow.pd.controller;

import com.osstem.ow.pd.service.ProductService;
import com.osstem.ow.pd.dto.*;
import com.osstem.ow.common.controller.BaseController;
import com.osstem.ow.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * 제품 관리 REST API
 * @author OWS AI Generator
 * @since 2025.01.03
 */
@Tag(name = "PD-Product", description = "제품 관리 API")
@RestController
@RequestMapping("/api/ow/pd/products")
@RequiredArgsConstructor
public class ProductController extends BaseController {
    
    private final ProductService productService;
    
    @Operation(summary = "제품 목록 조회", description = "검색 조건에 따른 제품 목록을 조회합니다.")
    @GetMapping
    @PreAuthorize("hasPermission('PD_PRODUCT', 'READ')")
    public ApiResponse<Page<ProductDto>> getProducts(
        @Valid ProductSearchRequest request
    ) {
        return success(productService.getProducts(request));
    }
    
    @Operation(summary = "제품 상세 조회", description = "제품 ID로 상세 정보를 조회합니다.")
    @GetMapping("/{prodId}")
    @PreAuthorize("hasPermission('PD_PRODUCT', 'READ')")
    public ApiResponse<ProductDetailDto> getProduct(@PathVariable Long prodId) {
        return success(productService.getProduct(prodId));
    }
    
    @Operation(summary = "제품 등록", description = "새로운 제품을 등록합니다.")
    @PostMapping
    @PreAuthorize("hasPermission('PD_PRODUCT', 'CREATE')")
    public ApiResponse<ProductDto> createProduct(
        @Valid @RequestBody ProductCreateRequest request
    ) {
        return success(productService.createProduct(request));
    }
    
    @Operation(summary = "제품 수정", description = "기존 제품 정보를 수정합니다.")
    @PutMapping("/{prodId}")
    @PreAuthorize("hasPermission('PD_PRODUCT', 'UPDATE')")
    public ApiResponse<ProductDto> updateProduct(
        @PathVariable Long prodId,
        @Valid @RequestBody ProductUpdateRequest request
    ) {
        return success(productService.updateProduct(prodId, request));
    }
    
    @Operation(summary = "제품 삭제", description = "제품을 논리적으로 삭제합니다.")
    @DeleteMapping("/{prodId}")
    @PreAuthorize("hasPermission('PD_PRODUCT', 'DELETE')")
    public ApiResponse<Void> deleteProduct(@PathVariable Long prodId) {
        productService.deleteProduct(prodId);
        return success();
    }
}`
    }
  ]
})
```

---

## 5. OWS 프런트엔드 표준

### 5.1 OWS 프런트엔드 MultiEdit 템플릿

```typescript
MultiEdit({
  edits: [
    // ========== Types: OWS 표준 ==========
    {
      file_path: "/frontend/src/types/pd/Product.ts",
      old_string: "",
      new_string: `
/**
 * 제품 관련 타입 정의 (OWS 표준)
 * @author OWS AI Generator
 * @since 2025.01.03
 */

// OWS 표준 코드 타입
export interface CodeInfo {
  cd: string;      // 코드
  cdNm: string;    // 코드명
  sortOrd: number; // 정렬순서
  useYn: string;   // 사용여부
}

// 제품 상태 코드
export const PROD_STAT_CD = {
  ACT: 'ACT',   // 활성
  INA: 'INA',   // 비활성
  DSC: 'DSC'    // 단종
} as const;

export type ProdStatCd = typeof PROD_STAT_CD[keyof typeof PROD_STAT_CD];

// 제품 기본 정보 (OWS 표준 필드명)
export interface Product {
  prodId: number;        // 제품ID
  prodNm: string;        // 제품명
  prodCd: string;        // 제품코드
  prodDesc?: string;     // 제품설명
  unitPrc: number;       // 단가
  stckQty: number;       // 재고수량
  prodStatCd: ProdStatCd; // 제품상태코드
  prodStatNm: string;    // 제품상태명
  mgrEmpNo: string;      // 관리자사번
  mgrEmpNm: string;      // 관리자명
  regDtm: string;        // 등록일시
  regEmpNo: string;      // 등록자사번
  regEmpNm: string;      // 등록자명
  updDtm: string;        // 수정일시
  updEmpNo: string;      // 수정자사번
  updEmpNm: string;      // 수정자명
}

// 제품 검색 조건 (OWS 표준)
export interface ProductSearchRequest {
  keyword?: string;      // 검색어
  prodStatCd?: ProdStatCd; // 제품상태
  mgrEmpNo?: string;     // 담당자사번
  startDt?: string;      // 시작일 (YYYY-MM-DD)
  endDt?: string;        // 종료일 (YYYY-MM-DD)
  page: number;          // 페이지번호 (0부터)
  size: number;          // 페이지크기
  sortBy: string;        // 정렬필드
  sortDir: 'ASC' | 'DESC'; // 정렬방향
}

// 제품 등록 요청 (OWS 표준)
export interface ProductCreateRequest {
  prodNm: string;        // 제품명
  prodCd: string;        // 제품코드
  prodDesc?: string;     // 제품설명
  unitPrc: number;       // 단가
  stckQty: number;       // 재고수량
}`
    },
    
    // ========== API Client: OWS 표준 ==========
    {
      file_path: "/frontend/src/api/pd/productApi.ts",
      old_string: "",
      new_string: `
import { owsAxios } from '@/utils/owsAxios';
import type { ApiResponse, Page } from '@/types/common';
import type {
  Product,
  ProductSearchRequest,
  ProductCreateRequest,
  ProductUpdateRequest
} from '@/types/pd/Product';

/**
 * 제품 관리 API (OWS 표준)
 * @author OWS AI Generator
 * @since 2025.01.03
 */
export const productApi = {
  
  /**
   * 제품 목록 조회
   */
  async getProducts(params: ProductSearchRequest): Promise<ApiResponse<Page<Product>>> {
    const response = await owsAxios.get('/api/ow/pd/products', { params });
    return response.data;
  },
  
  /**
   * 제품 상세 조회
   */
  async getProduct(prodId: number): Promise<ApiResponse<Product>> {
    const response = await owsAxios.get(\`/api/ow/pd/products/\${prodId}\`);
    return response.data;
  },
  
  /**
   * 제품 등록
   */
  async createProduct(data: ProductCreateRequest): Promise<ApiResponse<Product>> {
    const response = await owsAxios.post('/api/ow/pd/products', data);
    return response.data;
  },
  
  /**
   * 제품 수정
   */
  async updateProduct(prodId: number, data: ProductUpdateRequest): Promise<ApiResponse<Product>> {
    const response = await owsAxios.put(\`/api/ow/pd/products/\${prodId}\`, data);
    return response.data;
  },
  
  /**
   * 제품 삭제
   */
  async deleteProduct(prodId: number): Promise<ApiResponse<void>> {
    const response = await owsAxios.delete(\`/api/ow/pd/products/\${prodId}\`);
    return response.data;
  }
};`
    },
    
    // ========== Store: OWS 표준 ==========
    {
      file_path: "/frontend/src/stores/pd/productStore.ts",
      old_string: "",
      new_string: `
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { productApi } from '@/api/pd/productApi';
import { useOwsNotification } from '@/composables/useOwsNotification';
import { useOwsAuth } from '@/composables/useOwsAuth';
import type { Product, ProductSearchRequest } from '@/types/pd/Product';
import type { Page } from '@/types/common';

/**
 * 제품 관리 스토어 (OWS 표준)
 * @author OWS AI Generator
 * @since 2025.01.03
 */
export const useProductStore = defineStore('pd-product', () => {
  const { showSuccess, showError } = useOwsNotification();
  const { getCurrentUser } = useOwsAuth();
  
  // State
  const products = ref<Product[]>([]);
  const currentProduct = ref<Product | null>(null);
  const totalElements = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // OWS 표준 검색 조건
  const searchParams = ref<ProductSearchRequest>({
    keyword: '',
    prodStatCd: undefined,
    mgrEmpNo: undefined,
    startDt: undefined,
    endDt: undefined,
    page: 0,
    size: 20, // OWS 표준 페이지 크기
    sortBy: 'regDtm',
    sortDir: 'DESC'
  });
  
  // Getters
  const hasProducts = computed(() => products.value.length > 0);
  const totalPages = computed(() => Math.ceil(totalElements.value / searchParams.value.size));
  const currentPage = computed(() => searchParams.value.page + 1);
  
  // OWS 표준: 권한별 필터링
  const availableProducts = computed(() => {
    const user = getCurrentUser();
    if (user.authLvl === 'ADMIN') {
      return products.value; // 관리자: 모든 제품
    }
    return products.value.filter(p => p.mgrEmpNo === user.empNo); // 일반: 담당 제품만
  });
  
  // Actions
  /**
   * 제품 목록 조회
   */
  async function fetchProducts(params?: Partial<ProductSearchRequest>) {
    loading.value = true;
    error.value = null;
    
    if (params) {
      searchParams.value = { ...searchParams.value, ...params };
    }
    
    try {
      const response = await productApi.getProducts(searchParams.value);
      if (response.success) {
        products.value = response.data.content;
        totalElements.value = response.data.totalElements;
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || '제품 목록 조회에 실패했습니다.';
      showError(error.value);
      throw e;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * 제품 등록 (OWS 표준 프로세스)
   */
  async function createProduct(data: ProductCreateRequest) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await productApi.createProduct(data);
      if (response.success) {
        await fetchProducts(); // 목록 새로고침
        showSuccess('제품이 성공적으로 등록되었습니다.');
        return response.data;
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || '제품 등록에 실패했습니다.';
      showError(error.value);
      throw e;
    } finally {
      loading.value = false;
    }
  }
  
  return {
    // State
    products,
    currentProduct,
    totalElements,
    loading,
    error,
    searchParams,
    // Getters
    hasProducts,
    totalPages,
    currentPage,
    availableProducts,
    // Actions
    fetchProducts,
    createProduct
  };
});`
    },
    
    // ========== Vue Component: OWS 표준 ==========
    {
      file_path: "/frontend/src/views/pd/ProductList.vue",
      old_string: "",
      new_string: `
<template>
  <div class="ows-pd-product-list">
    <!-- OWS 표준 헤더 -->
    <ow-page-header 
      title="제품 관리" 
      :breadcrumb="breadcrumbItems"
    >
      <template #extra>
        <ow-button type="info" size="small" @click="handleHelp">
          <i class="fa fa-question-circle"></i> 도움말
        </ow-button>
      </template>
    </ow-page-header>
    
    <!-- OWS 표준 검색 영역 -->
    <ow-search-form @search="handleSearch" @reset="handleReset">
      <ow-row :gutter="16">
        <!-- 조회기간: OWS 필수 컴포넌트 -->
        <ow-col :span="8">
          <ow-form-item label="조회기간">
            <ow-biz-date-picker
              v-model:start-date="searchParams.startDt"
              v-model:end-date="searchParams.endDt"
              :preset-ranges="true"
              :max-range-months="12"
            />
          </ow-form-item>
        </ow-col>
        
        <!-- 담당자: OWS 필수 컴포넌트 -->
        <ow-col :span="8">
          <ow-form-item label="담당자">
            <ow-form-org
              v-model="searchParams.mgrEmpNo"
              :include-user="true"
              placeholder="담당자 선택"
              clearable
            />
          </ow-form-item>
        </ow-col>
        
        <!-- 상태: OWS 필수 컴포넌트 -->
        <ow-col :span="8">
          <ow-form-item label="제품상태">
            <ow-form-select
              v-model="searchParams.prodStatCd"
              :options="prodStatOptions"
              placeholder="전체"
              clearable
            />
          </ow-form-item>
        </ow-col>
      </ow-row>
      
      <ow-row :gutter="16">
        <ow-col :span="24">
          <ow-form-item label="검색어">
            <ow-input
              v-model="searchParams.keyword"
              placeholder="제품명, 제품코드로 검색"
              @keyup.enter="handleSearch"
            />
          </ow-form-item>
        </ow-col>
      </ow-row>
    </ow-search-form>
    
    <!-- OWS 표준 액션 영역 -->
    <div class="ows-action-area">
      <div class="left">
        <!-- 상태 필터: OWS 필수 컴포넌트 -->
        <ow-state-filter
          v-model="quickFilter"
          :options="prodStatOptions"
          @change="handleQuickFilter"
        />
      </div>
      <div class="right">
        <ow-button @click="handleExport">
          <i class="fa fa-download"></i> 엑셀 다운로드
        </ow-button>
        <ow-button 
          type="primary" 
          @click="handleCreate"
          v-ows-permission="'PD_PRODUCT:CREATE'"
        >
          <i class="fa fa-plus"></i> 신규 등록
        </ow-button>
      </div>
    </div>
    
    <!-- OWS 표준 데이터 그리드 -->
    <dx-data-grid
      :data-source="products"
      :columns="gridColumns"
      :show-borders="true"
      :show-row-lines="true"
      :hover-state-enabled="true"
      :allow-column-resizing="true"
      key-expr="prodId"
      @row-click="handleRowClick"
    >
      <dx-sorting mode="single" />
      <dx-selection mode="multiple" />
      <dx-load-panel :enabled="loading" />
      
      <!-- OWS 표준 컬럼 정의 -->
      <dx-column
        data-field="prodCd"
        caption="제품코드"
        :width="120"
        :fixed="true"
      />
      <dx-column
        data-field="prodNm"
        caption="제품명"
        :min-width="200"
      />
      <dx-column
        data-field="unitPrc"
        caption="단가"
        :width="120"
        alignment="right"
        data-type="number"
        format="currency"
      />
      <dx-column
        data-field="stckQty"
        caption="재고수량"
        :width="100"
        alignment="center"
        data-type="number"
      />
      <dx-column
        data-field="prodStatNm"
        caption="상태"
        :width="80"
        alignment="center"
        cell-template="statusTemplate"
      />
      <dx-column
        data-field="mgrEmpNm"
        caption="담당자"
        :width="100"
        alignment="center"
      />
      <dx-column
        data-field="regDtm"
        caption="등록일시"
        :width="140"
        data-type="datetime"
        format="yyyy-MM-dd HH:mm"
      />
      <dx-column
        caption="관리"
        :width="120"
        alignment="center"
        :allow-sorting="false"
        cell-template="actionTemplate"
      />
      
      <!-- OWS 표준 템플릿 -->
      <template #statusTemplate="{ data }">
        <ow-tag :type="getStatusType(data.row.data.prodStatCd)">
          {{ data.value }}
        </ow-tag>
      </template>
      
      <template #actionTemplate="{ data }">
        <div class="ows-action-buttons">
          <ow-button 
            size="small" 
            @click.stop="handleEdit(data.row.data)"
            v-ows-permission="'PD_PRODUCT:UPDATE'"
          >
            수정
          </ow-button>
          <ow-button 
            size="small" 
            type="danger" 
            @click.stop="handleDelete(data.row.data)"
            v-ows-permission="'PD_PRODUCT:DELETE'"
          >
            삭제
          </ow-button>
        </div>
      </template>
    </dx-data-grid>
    
    <!-- OWS 표준 페이징 -->
    <ow-pagination
      v-model:current="currentPage"
      :total="totalElements"
      :page-size="searchParams.size"
      :show-size-changer="true"
      :show-quick-jumper="true"
      @change="handlePageChange"
    />
    
    <!-- OWS 표준 모달 -->
    <product-form-modal
      v-model:visible="formModalVisible"
      :product="selectedProduct"
      :mode="formMode"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '@/stores/pd/productStore';
import { useOwsCode } from '@/composables/useOwsCode';
import { useOwsExport } from '@/composables/useOwsExport';
import { useOwsConfirm } from '@/composables/useOwsConfirm';
import { PROD_STAT_CD } from '@/types/pd/Product';
import ProductFormModal from './components/ProductFormModal.vue';
import type { Product } from '@/types/pd/Product';

const router = useRouter();
const productStore = useProductStore();
const { getCodeOptions } = useOwsCode();
const { exportExcel } = useOwsExport();
const { confirm } = useOwsConfirm();

// Store 데이터
const products = computed(() => productStore.products);
const totalElements = computed(() => productStore.totalElements);
const loading = computed(() => productStore.loading);
const searchParams = computed(() => productStore.searchParams);

// OWS 표준 코드 옵션
const prodStatOptions = computed(() => getCodeOptions('PROD_STAT'));

// 로컬 상태
const formModalVisible = ref(false);
const selectedProduct = ref<Product | null>(null);
const formMode = ref<'create' | 'edit'>('create');
const quickFilter = ref('');

// OWS 표준 브레드크럼
const breadcrumbItems = [
  { text: '홈', to: '/dashboard' },
  { text: '제품관리', to: '/pd' },
  { text: '제품목록', active: true }
];

// 페이지 변경
const currentPage = computed({
  get: () => productStore.currentPage,
  set: (value) => productStore.changePage(value)
});

// OWS 표준 상태 타입
function getStatusType(prodStatCd: string): string {
  switch (prodStatCd) {
    case PROD_STAT_CD.ACT: return 'success';
    case PROD_STAT_CD.INA: return 'warning';
    case PROD_STAT_CD.DSC: return 'danger';
    default: return 'default';
  }
}

// 이벤트 핸들러들...
function handleSearch() {
  productStore.fetchProducts({ page: 0 });
}

function handleReset() {
  productStore.resetSearchParams();
  productStore.fetchProducts();
}

// 초기 데이터 로드
onMounted(() => {
  productStore.fetchProducts();
});
</script>

<style lang="scss" scoped>
.ows-pd-product-list {
  @include ows-page-container;
  
  .ows-action-area {
    @include ows-action-area;
  }
  
  .ows-action-buttons {
    @include ows-action-buttons;
  }
}
</style>`
    }
  ]
})
```

---

## 6. OWS MultiEdit 템플릿

### 6.1 업무별 표준 템플릿

#### 제품관리(PD) 템플릿
```bash
# Claude Code 실행 명령
"OWS 제품관리 CRUD를 MultiEdit으로 생성해주세요. 
패키지는 com.osstem.ow.pd, 
OWS 표준 컴포넌트 (OwBizDatePicker, OwFormOrg, OwStateFilter) 사용,
업무 필드는 제품코드, 제품명, 단가, 재고수량, 담당자 포함해주세요."
```

#### 고객서비스(CS) 템플릿
```bash
"OWS 고객문의 관리 시스템을 MultiEdit으로 생성해주세요.
패키지는 com.osstem.ow.cs,
문의유형, 처리상태, 담당자, 고객정보 포함하고,
OWS 표준 컴포넌트로 구현해주세요."
```

### 6.2 도메인별 필수 필드

| 업무 도메인 | 필수 필드 | OWS 컴포넌트 |
|-------------|-----------|--------------|
| **PD (제품)** | 제품코드, 제품명, 단가, 재고 | OwInput, OwInputNumber |
| **CS (고객)** | 문의유형, 처리상태, 고객정보 | OwFormSelect, OwStateFilter |
| **OM (주문)** | 주문번호, 주문일, 배송상태 | OwBizDatePicker, OwStateFilter |
| **WM (창고)** | 창고코드, 위치정보, 재고량 | OwFormSelect, OwInputNumber |
| **QM (품질)** | 검사항목, 합격여부, 검사일 | OwFormSelect, OwBizDatePicker |

---

## 7. 비즈니스 도메인별 특화

### 7.1 의료기기 특화 (Medical Device)
```typescript
// 의료기기 특화 엔티티
@Entity
@Table(name = "md_devices")
public class MedicalDevice extends BaseEntity {
    
    @Column(name = "dev_no", unique = true) // 의료기기 허가번호
    private String devNo;
    
    @Column(name = "fda_cd") // FDA 승인 코드
    private String fdaCd;
    
    @Column(name = "ce_mark_yn") // CE 마킹 여부
    private String ceMarkYn;
    
    @Column(name = "exp_dt") // 유효기간
    private LocalDate expDt;
    
    @Column(name = "sterile_yn") // 멸균 여부
    private String sterileYn;
}

// OWS 컴포넌트: 의료기기 특화
<ow-medical-device-selector
  v-model="selectedDevice"
  :filter-by-category="true"
  :show-expiry-warning="true"
  :include-fda-status="true"
/>
```

### 7.2 치과 특화 (Dental)
```typescript
// 치과 임플란트 특화
@Entity
@Table(name = "dt_implants")
public class DentalImplant extends BaseEntity {
    
    @Column(name = "impl_type_cd") // 임플란트 타입
    private String implTypeCd;
    
    @Column(name = "diameter") // 직경 (mm)
    private BigDecimal diameter;
    
    @Column(name = "length") // 길이 (mm)
    private BigDecimal length;
    
    @Column(name = "surface_cd") // 표면처리 코드
    private String surfaceCd;
    
    @Column(name = "material_cd") // 재질 코드
    private String materialCd;
}

// OWS 컴포넌트: 치과 특화
<ow-dental-implant-spec
  v-model="implantSpec"
  :show-compatibility="true"
  :filter-by-procedure="selectedProcedure"
/>
```

---

## 8. OWS 품질 보증

### 8.1 코드 품질 체크리스트

#### 백엔드 체크리스트
- [ ] **패키지 구조**: `com.osstem.ow.{업무코드}` 준수
- [ ] **필드명**: OWS 표준 약어 사용 (예: `prodNm`, `regDtm`)
- [ ] **Audit 필드**: BaseEntity 상속으로 자동 처리
- [ ] **권한 체크**: `@PreAuthorize` 어노테이션 적용
- [ ] **로깅**: 주요 비즈니스 로직에 로그 추가
- [ ] **예외 처리**: OWS 표준 예외 클래스 사용
- [ ] **메시지**: MessageUtils 사용한 다국어 지원

#### 프런트엔드 체크리스트
- [ ] **컴포넌트**: OWS UI 컴포넌트 우선 사용
- [ ] **필수 영역**: 조회기간, 상태필터, 담당자 포함
- [ ] **그리드**: DxDataGrid 사용, OWS 표준 컬럼 구성
- [ ] **권한 체크**: `v-ows-permission` 디렉티브 적용
- [ ] **다국어**: i18n 메시지 키 사용
- [ ] **접근성**: WCAG 2.1 AA 수준 준수
- [ ] **반응형**: 다양한 화면 크기 대응

### 8.2 자동 품질 검증 도구

```typescript
// OWS 품질 검증 스크립트
function validateOwsStandards(files: string[]) {
  const violations: QualityViolation[] = [];
  
  files.forEach(file => {
    // 백엔드 검증
    if (file.endsWith('.java')) {
      checkJavaOwsStandards(file, violations);
    }
    
    // 프런트엔드 검증
    if (file.endsWith('.vue')) {
      checkVueOwsStandards(file, violations);
    }
  });
  
  return violations;
}

function checkJavaOwsStandards(file: string, violations: QualityViolation[]) {
  const content = fs.readFileSync(file, 'utf8');
  
  // 패키지 구조 검증
  if (!content.includes('com.osstem.ow.')) {
    violations.push({
      file,
      rule: 'OWS_PACKAGE_STRUCTURE',
      message: 'OWS 표준 패키지 구조를 따르지 않습니다.'
    });
  }
  
  // Audit 필드 검증
  if (content.includes('@Entity') && !content.includes('extends BaseEntity')) {
    violations.push({
      file,
      rule: 'OWS_AUDIT_FIELDS',
      message: 'BaseEntity를 상속받아야 합니다.'
    });
  }
}

function checkVueOwsStandards(file: string, violations: QualityViolation[]) {
  const content = fs.readFileSync(file, 'utf8');
  
  // OWS 컴포넌트 사용 검증
  if (content.includes('<input') && !content.includes('OwInput')) {
    violations.push({
      file,
      rule: 'OWS_COMPONENT_USAGE',
      message: 'HTML input 대신 OwInput을 사용해야 합니다.'
    });
  }
  
  // 필수 영역 검증
  if (content.includes('search-form') && !content.includes('OwBizDatePicker')) {
    violations.push({
      file,
      rule: 'OWS_MANDATORY_COMPONENTS',
      message: '검색 폼에 OwBizDatePicker가 포함되어야 합니다.'
    });
  }
}
```

---

## 🎯 결론

### OWS 프로젝트 성공 요소

1. **표준 준수**: OWS 아키텍처와 컴포넌트 표준 엄격 준수
2. **도메인 특화**: 의료기기/치과 업무 특성 반영
3. **품질 보증**: 자동화된 코드 품질 검증
4. **사용자 경험**: 일관된 UI/UX로 학습 비용 최소화
5. **보안 강화**: 의료법규 준수 및 데이터 보호
6. **확장성**: 다국가 진출을 위한 다국어/다통화 지원

Claude Code의 MultiEdit 기능으로 이 모든 요소를 한 번에 구현하여 **OWS 표준 엔터프라이즈 애플리케이션**을 신속하게 개발할 수 있습니다! 🚀

### OWS 개발 시 Claude Code 사용법

```bash
# 표준 요청 패턴
"OWS {업무명} 관리 시스템을 MultiEdit으로 생성해주세요.
- 패키지: com.osstem.ow.{업무코드}
- OWS 표준 컴포넌트 사용 (OwBizDatePicker, OwFormOrg, OwStateFilter)
- 업무 필드: {구체적인 필드 나열}
- 권한 체크 포함
- 다국어 지원"
```

이렇게 요청하면 OWS 표준을 완벽히 준수하는 엔터프라이즈급 코드가 자동 생성됩니다!
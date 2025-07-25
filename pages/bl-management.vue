<template>
  <div class="py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">BL 번호 관리 시스템</h1>
      
      <div class="bg-white shadow rounded-lg p-6">
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="bl-number" class="block text-sm font-medium text-gray-700">
                기존 BL 번호
              </label>
              <input
                id="bl-number"
                v-model="formData.originalBLNumber"
                type="text"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="조회할 BL 번호를 입력하세요"
              />
            </div>

            <div>
              <label for="product-code" class="block text-sm font-medium text-gray-700">
                물품 번호
              </label>
              <input
                id="product-code"
                v-model="formData.productCode"
                type="text"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="물품 번호를 입력하세요"
              />
            </div>

            <div>
              <label for="quantity" class="block text-sm font-medium text-gray-700">
                수량
              </label>
              <input
                id="quantity"
                v-model.number="formData.quantity"
                type="number"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="수량을 입력하세요"
              />
            </div>

            <div>
              <label for="new-bl-number" class="block text-sm font-medium text-gray-700">
                새 BL 번호
              </label>
              <input
                id="new-bl-number"
                v-model="formData.newBLNumber"
                type="text"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="새로운 BL 번호를 입력하세요"
              />
            </div>
          </div>

          <div class="flex space-x-4">
            <button
              @click="searchBL"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              BL 조회
            </button>

            <button
              @click="processBL"
              :disabled="!blData || isLoading || !formData.newBLNumber"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              처리 시작
            </button>
          </div>
        </div>

        <div v-if="blData" class="mt-8">
          <h3 class="text-lg font-medium text-gray-900 mb-4">조회 결과</h3>
          <div class="bg-gray-50 p-4 rounded-md">
            <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">BL 번호</dt>
                <dd class="text-sm text-gray-900">{{ blData.blNumber }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">물품명</dt>
                <dd class="text-sm text-gray-900">{{ blData.productName }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">물품 코드</dt>
                <dd class="text-sm text-gray-900">{{ blData.productCode }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">수입자</dt>
                <dd class="text-sm text-gray-900">{{ blData.importer }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">신고일자</dt>
                <dd class="text-sm text-gray-900">{{ blData.reportDate }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">기존 수량</dt>
                <dd class="text-sm text-gray-900">{{ blData.quantity }} {{ blData.unit }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div v-if="processResult" class="mt-8">
          <h3 class="text-lg font-medium text-gray-900 mb-4">처리 결과</h3>
          <div class="bg-green-50 p-4 rounded-md">
            <p class="text-sm text-green-800 mb-2">{{ processResult.message }}</p>
            <div v-if="processResult.files && processResult.files.length > 0" class="mt-2">
              <p class="text-sm font-medium text-green-800">첨부된 파일:</p>
              <ul class="mt-1 list-disc list-inside text-sm text-green-700">
                <li v-for="file in processResult.files" :key="file.id">
                  {{ file.name }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div v-if="error" class="mt-8">
          <div class="bg-red-50 p-4 rounded-md">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const formData = reactive({
  originalBLNumber: '',
  productCode: '',
  quantity: null,
  newBLNumber: ''
})

const blData = ref(null)
const processResult = ref(null)
const error = ref('')
const isLoading = ref(false)

const searchBL = async () => {
  if (!formData.originalBLNumber) {
    error.value = 'BL 번호를 입력해주세요.'
    return
  }

  isLoading.value = true
  error.value = ''
  blData.value = null
  processResult.value = null
  
  try {
    const response = await $fetch('/api/unipass/search', {
      method: 'POST',
      body: {
        blNumber: formData.originalBLNumber
      }
    })
    
    blData.value = response.data
    
    // 조회 결과의 물품 코드를 폼에 자동 입력
    if (response.data.productCode) {
      formData.productCode = response.data.productCode
    }
  } catch (err) {
    error.value = err.data?.message || '조회 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

const processBL = async () => {
  if (!blData.value || !formData.newBLNumber || !formData.quantity) {
    error.value = '모든 필드를 입력해주세요.'
    return
  }

  isLoading.value = true
  error.value = ''
  processResult.value = null
  
  try {
    const response = await $fetch('/api/unipass/process', {
      method: 'POST',
      body: {
        originalBLNumber: formData.originalBLNumber,
        newBLNumber: formData.newBLNumber,
        productName: blData.value.productName,
        productCode: formData.productCode,
        quantity: formData.quantity
      }
    })
    
    processResult.value = response
  } catch (err) {
    error.value = err.data?.message || '처리 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}
</script>
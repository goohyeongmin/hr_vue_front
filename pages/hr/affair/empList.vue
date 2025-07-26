<script setup lang="ts">
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { VDataTable } from "vuetify/labs/VDataTable";

const headers = [
  // { title: '사번', key: 'empCode' },
  { title: "직원명", key: "empName" },
  { title: "입사일", key: "hireDate" },
  { title: "생년월일", key: "birthDate" },
  { title: "성별", key: "gender" },
  { title: "부서번호", key: "deptCode" },
  { title: "부서이름", key: "deptName" },
  { title: "고용상태", key: "retirementDate" },
];

const empList = ref([]);
const search = ref("");
const loading = ref(false);



const accountData = {
  avatarImg: "/_nuxt/assets/images/empImages/EMP-09.jpeg",
};//구씨
const showModal = ref(false);//구씨
const accountDataLocal = ref(structuredClone(accountData));//구씨
const formImg = ref(null); //구씨
const empDetail = ref({
  empCode: "",
  workplaceCode: "",
  deptCode: "",
  positionCode: "",
  phoneNumber: "",
  email: "",
  zipCode: "",
  basicAddress: "",
  detailAddress: "",
  levelOfEducation: "",
  image: "",
  empName: "",
  deptName: "",
  gender: "",
  hireDate: "",
  birthDate: "",
}); // 구씨


// 직원 리스트 조회
const fetchData = async () => {
  try {
    loading.value = false;

    const response = await axios.get("http://localhost:8282/hr/affair/emp");

    empList.value = response.data.empList;
    console.log("[emp_list]", empList.value);
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

// 직원 검색
const filteredEmpList = computed(() => {
  return empList.value.filter((emp: any) => {
    return Object.values(emp).some((field) => {
      if (typeof field === "string")
        return field.toLowerCase().includes(search.value.toLowerCase());

      return false;
    });
  });
});


const onRowClick = async (event: any, item: any) => {
  console.log("[clickEmp]", item.item.empCode);
  try {
    formImg.value = null;
    showModal.value = true;//구씨
    const clickEmp = item.item.empCode;
    const res = await axios.get(
      `http://localhost:8282/hr/affair/emp/${clickEmp}`
    );

    console.log("[empDetailInfo]", res.data.empDetailInfo[0]);
    empDetail.value = res.data.empDetailInfo[0];
    console.log(empDetail.value);
    console.log("positionCode", empDetail.value.positionCode);
    console.log("[clickEmp]", clickEmp);
    accountDataLocal.value.avatarImg = `/_nuxt/assets/images/empImages/${empDetail.value.image}`;
  } catch (e) {
    console.error(e);
  }
};//구씨


</script>

<template>
  <VApp>
    <div>
      <h1 class="mb-6">직원정보 조회</h1>

      <!-- 직원 목록 카드 -->
      <VCard>
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="search"
                density="compact"
                placeholder="검색"
                append-inner-icon="tabler-search"
                single-line
                hide-details
                dense
                outlined
              />
            </VCol>
          </VRow>

          <!-- 직원 테이블 -->
          <VDataTable
            :headers="headers"
            :items="filteredEmpList"
            :items-per-page="10"
            @click:row="onRowClick"
          />
        </VCardText>
      </VCard>

      <!-- 직원 상세 모달 -->
      <VDialog v-model="showModal" max-width="1000">
        <VCard>
          <VCardTitle class="d-flex justify-space-between align-center">
            직원기초정보
            <div>
              <VBtn class="ml-3" @click="editFunc">
                <VIcon start icon="tabler-edit" />수정
              </VBtn>
              <VBtn color="error" class="ml-3" @click="deleteFunc">
                <VIcon start icon="tabler-trash" />삭제
              </VBtn>
              <VBtn class="ml-3" @click="showModal = false">닫기</VBtn>
            </div>
          </VCardTitle>

          <VCardText>
            <VRow>
              <!-- 사진 -->
              <VCol cols="12" md="3">
                <VAvatar
                  rounded
                  size="100"
                  class="mb-3"
                  :image="accountDataLocal.avatarImg"
                />
                <input
                  ref="refInputEl"
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  hidden
                  @input="changeAvatar"
                />
                <VBtn variant="outlined" @click="refInputEl?.click()">
                  <VIcon icon="tabler-cloud-upload" class="d-sm-none" />
                  <span class="d-none d-sm-block">사진 업로드</span>
                </VBtn>
              </VCol>

              <!-- 기본 정보 -->
              <VCol cols="12" md="3">
                <VTextField v-model="empDetail.empName" label="사원명" />
              </VCol>
              <VCol cols="12" md="3">
                <VTextField v-model="empDetail.empCode" label="사번" />
              </VCol>
              <VCol cols="12" md="3">
                <AppDateTimePicker v-model="empDetail.birthDate" placeholder="생년월일" />
              </VCol>
              <VCol cols="12" md="3">
                <VSelect
                  v-model="empDetail.gender"
                  label="성별"
                  :items="gender"
                  :item-props="itemProps"
                />
              </VCol>
              <VCol cols="12" md="3">
                <VSelect
                  v-model="empDetail.deptCode"
                  label="부서"
                  :items="deptList"
                  :item-props="itemProps"
                />
              </VCol>
              <VCol cols="12" md="3">
                <VTextField v-model="empDetail.deptCode" label="부서번호" readonly />
              </VCol>
              <VCol cols="12" md="3">
                <AppDateTimePicker v-model="empDetail.hireDate" placeholder="입사일" />
              </VCol>
            </VRow>

            <!-- 세부 정보 -->
            <VRow>
              <VCol cols="12" md="3">
                <VSelect
                  v-model="empDetail.positionCode"
                  label="직급"
                  :items="positions"
                  :item-props="itemProps"
                />
              </VCol>
              <VCol cols="12" md="3">
                <VTextField v-model="empDetail.phoneNumber" label="전화번호" />
              </VCol>
              <VCol cols="12" md="3">
                <VTextField v-model="empDetail.email" label="이메일" />
              </VCol>
              <VCol cols="12" md="3">
                <VSelect
                  v-model="empDetail.workplaceCode"
                  label="근무지"
                  :items="workplaceList"
                  :item-props="itemProps"
                />
              </VCol>
              <VCol cols="12" md="3">
                <VSelect
                  v-model="empDetail.levelOfEducation"
                  label="최종학력"
                  :items="educations"
                  :item-props="itemProps"
                />
              </VCol>
              <VCol cols="12" md="3">
                <VTextField
                  v-model="empDetail.zipCode"
                  label="우편번호(클릭)"
                  @click="searchPost"
                />
              </VCol>
              <VCol cols="12" md="3">
                <VTextField v-model="empDetail.basicAddress" label="주소" />
              </VCol>
              <VCol cols="12" md="3">
                <VTextField v-model="empDetail.detailAddress" label="상세주소" />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VDialog>
    </div>
  </VApp>
</template>




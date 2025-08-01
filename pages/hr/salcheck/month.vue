<script setup lang="ts">
import SalcheckMonthModal from "@/components/hr/salary/SalcheckMonthModal.vue";
import { paginationMeta } from "@/server/utils/paginationMeta";
import { affairStore } from "@/store/hr/affair";
import { baseStore } from "@/store/hr/base";
import { salaryStore } from "@/store/hr/salary";
import type { SalaryHeader } from "@/types/salary/types";
import { VDataTable } from "vuetify/labs/VDataTable";

// salCheckStore에 사용하는 findSalaryData 확인하기
const options = ref({
  page: 1,
  itemsPerPage: 5,
  sortBy: [""],
  sortDesc: [false],
});

const search = ref("");
const selectedYear = ref("");
const selectedMonth = ref("");
const selectedEmp = ref("");
const salList: any = ref([]);
const monthList: any = ref([]);
const yearList: any = ref([]);
const empList: any = ref([]);

const fetchData = async () => {
  await affairStore().FETCH_ALL_EMP();
  await baseStore().FETCH_MONTHLIST();
  await baseStore().FETCH_YEARLIST();

  const monthListData = baseStore().monthList;
  const yearListData = baseStore().yearList;
  const empListData = affairStore().all_emp_list;

  monthList.value = monthListData
    ? Object.values(monthListData).map((item) => item.month)
    : [];
  yearList.value = yearListData
    ? Object.values(yearListData).map((item) => item.year)
    : [];
  empList.value = empListData
    ? Object.values(empListData).map((item) => {
        return { title: item.empName, value: item.empCode };
      })
    : [];
};

const fetchData2 = async () => {
  const month = !selectedMonth.value ? "%" : selectedMonth.value;
  const emp = !selectedEmp.value ? "%" : selectedEmp.value;

  const findSalaryData = {
    applyYearMonth: `${selectedYear.value}-${month.trim()}`,
    empCode: emp,
    detailCodeName: "%",
    finalizeStatus: "Y",
  };

  await salaryStore().SEARCH_SALARY(findSalaryData);

  salList.value = salaryStore().salaryList;
};

const headers: SalaryHeader[] = [
  { title: "해당 년월", key: "applyYearMonth", align: "center" },
  { title: "사원 번호", key: "empCode", align: "center" },
  { title: "사원 명", key: "empName", align: "center" },
  { title: "실 지급액", key: "realSalary", align: "center" },
  { title: "승인상태", key: "finalizeStatus", align: "center" },
];

const handleRowClick = async (row) => {
  const monthDeductionData = {
    empCode: row.item.empCode,
    applyYearMonth: row.item.applyYearMonth,
  };

  await salaryStore().SET_ROW_LIST(row.item);
  await salaryStore().FIND_TAX(monthDeductionData);
  console.log(salaryStore().rowList);
  await salaryStore().SET_DIALOG(true);
};

const filteredData = computed(() => {
  return salList.value.filter((emp: any) => {
    return Object.values(emp).some((field) => {
      if (typeof field === "string")
        return field.toLowerCase().includes(search.value.toLowerCase());
      return false;
    });
  });
});

onBeforeMount(fetchData);
watch([selectedYear, selectedMonth, selectedEmp], fetchData2, {
  immediate: true,
});
</script>

<template>
  <h1 class="mb-6">급여조회</h1>
  <VCard class="mb-6">
    <VCardText>
      <VRow>
        <VCol cols="12" sm="4">
          <AppSelect
            v-model="selectedYear"
            label="해당 연도"
            placeholder="해당 연도"
            :items="yearList"
            clearable
            clear-icon="tabler-x"
          />
        </VCol>

        <VCol cols="12" sm="4">
          <AppSelect
            v-model="selectedMonth"
            label="해당 월"
            placeholder="해당 월"
            :items="monthList"
            clearable
            clear-icon="tabler-x"
          />
        </VCol>

        <VCol cols="12" sm="4">
          <AppSelect
            v-model="selectedEmp"
            label="해당 사원"
            placeholder="해당 사원"
            :items="empList"
            clearable
            clear-icon="tabler-x"
          />
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
  <VCard>
    <VCardText class="d-flex flex-wrap py-4 gap-4">
      <div class="me-3 d-flex gap-3">
        <AppSelect
          :model-value="options.itemsPerPage"
          :items="[
            { value: 5, title: '5' },
            { value: 10, title: '10' },
            { value: 25, title: '25' },
            { value: 50, title: '50' },
            { value: -1, title: 'All' },
          ]"
          style="inline-size: 6.25rem"
          @update:model-value="options.itemsPerPage = parseInt($event, 10)"
        />
      </div>
      <VSpacer />

      <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
        <!-- 👉 Search  -->
        <div style="inline-size: 10rem">
          <AppTextField
            v-model="search"
            placeholder="Search"
            density="compact"
          />
        </div>
      </div>
    </VCardText>
    <VDivider />
    <VDataTable
      :headers="headers"
      :items="filteredData"
      :items-per-page="options.itemsPerPage"
      :page="options.page"
      :options="options"
      @click:row="(_, row) => handleRowClick(row)"
    >
      <template #bottom>
        <VDivider />
        <VCardText class="pt-2">
          <div
            class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2"
          >
            <p class="text-sm text-disabled mb-0">
              {{
                paginationMeta(
                  { page: options.page, itemsPerPage: options.itemsPerPage },
                  filteredData.length
                )
              }}
            </p>

            <VPagination
              v-model="options.page"
              :total-visible="$vuetify.display.smAndDown ? 3 : 5"
              :length="Math.ceil(filteredData.length / options.itemsPerPage)"
            />
          </div>
        </VCardText>
      </template>
    </VDataTable>
  </VCard>
  <SalcheckMonthModal />
</template>

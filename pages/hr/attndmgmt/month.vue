<template>
  <div class="text-center section">
    <h2 class="h2">📅 직원 근태 달력</h2>
    <p class="text-lg font-medium text-gray-600 mb-6">
      날짜를 클릭해 근태를 등록하세요.
    </p>

    <v-calendar
      class="근태달력표 max-w-full"
      is-expanded
      :attributes="attributes"
      :masks="{ weekdays: 'WWW' }"
      disable-page-swipe
      @dayclick="onDateClick"
    >
      <template v-slot:day-content="{ day, attributes }">
        <div class="flex flex-col h-full z-10 overflow-hidden px-1"
              @click="()=> onDateClick({date: day.date})"
        >
          <span class="day-label text-sm text-gray-900">{{ day.day }}</span>
          <div class="flex-grow overflow-y-auto overflow-x-auto">
            <p
              v-for="attr in attributes"
              :key="attr.key"
              class="text-xs leading-tight rounded-sm p-1 mt-0 mb-1"
              :class="attr.customData.class"
            >
              {{ attr.customData.title }}
            </p>
          </div>
        </div>
      </template>
    </v-calendar>

    <!-- 등록 모달 -->
    <v-dialog v-model="showModal" max-width="500">
      <v-card>
        <v-card-title>{{ selectedDate }} 근태 등록</v-card-title>
        <v-card-text>
          <v-text-field v-model="formData.startTime" label="출근 시간" type="time" />
          <v-text-field v-model="formData.endTime" label="퇴근 시간" type="time" />
          <v-select v-model="formData.type" :items="eventTypes" label="근태 유형" />
          <v-text-field v-model="formData.memo" label="비고" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showModal = false">닫기</v-btn>
          <v-btn color="primary" @click="saveEvent">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedDate = ref('')
const showModal = ref(false)

const formData = ref({
  startTime: '',
  endTime: '',
  type: '',
  memo: '',
})

const attributes = ref([])

const eventTypes = ['출근', '퇴근', '지각', '외출', '야근', '휴가']

const getTypeColorClass = (type) => {
  switch (type) {
    case '출근': return 'bg-green-500 text-white'
    case '퇴근': return 'bg-blue-500 text-white'
    case '지각': return 'bg-yellow-500 text-black'
    case '외출': return 'bg-teal-500 text-white'
    case '야근': return 'bg-purple-500 text-white'
    case '휴가': return 'bg-red-500 text-white'
    default: return 'bg-gray-500 text-white'
  }
}

const onDateClick = ({ date }) => {
  selectedDate.value = date.toISOString().slice(0, 10)
  showModal.value = true
}

const saveEvent = () => {
  attributes.value.push({
    key: Date.now(),
    dates: selectedDate.value,
    customData: {
      title: `${formData.value.type} (${formData.value.startTime} ~ ${formData.value.endTime})`,
      class: getTypeColorClass(formData.value.type),
    },
  })
  showModal.value = false
  // 입력 초기화
  formData.value = {
    startTime: '',
    endTime: '',
    type: '',
    memo: '',
  }
}
</script>

<style lang="postcss" scoped>
/* 스크롤 제거 */
::-webkit-scrollbar {
  width: 0px;
}
::-webkit-scrollbar-track {
  display: none;
}

/* 달력 UI 커스터마이징 */
.근태달력표::deep(.vc-container) {
  --day-border: 1px solid #ccc;
  --day-width: 90px;
  --day-height: 90px;
  --weekday-bg: #f8fafc;

  & .vc-day {
    background-color: white;
    border-bottom: var(--day-border);
    border-right: var(--day-border);
    height: var(--day-height);
    min-width: var(--day-width);
  }
  & .vc-weekday {
    background-color: var(--weekday-bg);
    font-weight: 500;
  }
}
</style>

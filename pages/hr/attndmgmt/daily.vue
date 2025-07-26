<script>
// 미들웨어 적용
definePageMeta({
  middleware: 'attendance-auth'
})
</script>

<template>
  <div class="attendance-calendar">
    <h1 class="mb-6">일근태관리</h1>

    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <VBtn icon="mdi-chevron-left" variant="text" @click="changeMonth(-1)" />
        <h2>{{ currentDate.getFullYear() }}년 {{ currentDate.getMonth() + 1 }}월</h2>
        <VBtn color="primary" @click="fetchAttendanceData">조회</VBtn>
        <VBtn icon="mdi-chevron-right" variant="text" @click="changeMonth(1)" />
      </VCardTitle>

      <!-- 헤더 사원 선택 -->
      <VCardText>
        <VRow class="mb-4">
          <VCol cols="4">
            <VSelect
              v-model="headerSelectedEmp"
              :items="emp_list"
              label="조회할 사원 선택"
              item-title="text"
              item-value="value"
              clearable
              @update:modelValue="onHeaderEmpChange"
            />
          </VCol>
        </VRow>

        <div class="calendar-header">
          <div class="day-header sunday">일</div>
          <div class="day-header">월</div>
          <div class="day-header">화</div>
          <div class="day-header">수</div>
          <div class="day-header">목</div>
          <div class="day-header">금</div>
          <div class="day-header saturday">토</div>
        </div>

        <div class="calendar-body">
          <div
            v-for="day in calendarDays"
            :key="day.dateString"
            class="calendar-day"
            :class="{
              'other-month': !day.isCurrentMonth,
              'today': day.isToday,
              'has-attendance': attendanceData[day.dateString],
              'sunday': day.date.getDay() === 0,
              'saturday': day.date.getDay() === 6
            }"
            @click="onDateClick(day.dateString)"
          >
            <div class="day-number">{{ day.date.getDate() }}</div>

            <div v-if="attendanceData[day.dateString]" class="attendance-info">
              <VChip
                :color="getAttendanceColor(attendanceData[day.dateString].type)"
                size="x-small"
                class="mb-1"
              >
                {{ getAttendanceLabel(attendanceData[day.dateString].type) }}
              </VChip>

              <div class="attendance-details">
                <div v-if="attendanceData[day.dateString].checkIn" class="time-info">
                  {{ attendanceData[day.dateString].checkIn }}
                </div>
                <div v-if="attendanceData[day.dateString].checkOut" class="time-info">
                  {{ attendanceData[day.dateString].checkOut }}
                </div>
              </div>

              <VChip
                :color="getStatusColor(attendanceData[day.dateString].status)"
                size="x-small"
                variant="outlined"
              >
                {{
                  attendanceData[day.dateString].status === 'pending' ? '대기'
                    : attendanceData[day.dateString].status === 'approved' ? '승인'
                    : '거부'
                }}
              </VChip>
            </div>
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- 모달 -->
    <VDialog v-model="showModal" max-width="600">
      <VCard>
        <VCardTitle>{{ selectedDate }} 근태 관리</VCardTitle>
        <VCardText>
          <VForm @submit.prevent="saveAttendance">
            <VRow>
              <VCol cols="12">
                <VSelect
                  v-model="modalSelectedEmp"
                  :items="emp_list"
                  label="등록할 사원 선택"
                  item-title="text"
                  item-value="value"
                  required
                />
              </VCol>
              
              <VCol cols="12">
                <VSelect
                  v-model="selectedAttdTypeText"
                  :items="attendanceTypeList.map(t=>t.text)"
                  label="근태 유형"
                  required
                />
              </VCol>

              <VCol cols="6" v-if="shouldShowTimeFields">
                <VTextField v-model="formData.checkIn" label="출근 시간" type="time" />
              </VCol>

              <VCol cols="6" v-if="shouldShowTimeFields">
                <VTextField v-model="formData.checkOut" label="퇴근 시간" type="time" />
              </VCol>

              <VCol cols="12" v-if="!shouldShowTimeFields">
                <VTextarea v-model="formData.reason" label="사유" rows="3" />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn color="error" variant="text" @click="deleteAttendance" v-if="attendanceData[selectedDate || '']">삭제</VBtn>
          <VBtn color="grey" variant="text" @click="closeModal">취소</VBtn>
          <VBtn color="primary" variant="elevated" @click="saveAttendance">저장</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/store/hr/affair'

// definePageMeta({
//   middleware: 'auth-attendance' // 이름만 쓰면 Nuxt가 자동 연결
// })

const userStore = useUserStore()

const currentDate = ref(new Date())
const selectedDate = ref(null)
const showModal = ref(false)

// 헤더에서 사용할 사원 선택 (조회용)
const headerSelectedEmp = ref('')
// 모달에서 사용할 사원 선택 (등록용)
const modalSelectedEmp = ref('')

const emp_list = ref([])
const formData = ref({ type: 'work', checkIn: '', checkOut: '', reason: '' })
const attendanceData = ref({})
const selectedAttdTypeText = ref('')

const attendanceTypeList = [
  { text: '근무', value: 'ADC001' },
  { text: '휴가', value: 'ADC002' },
  { text: '조퇴', value: 'ADC003' },
  { text: '병가', value: 'ADC007' },
  { text: '연차', value: 'ASC005' },
  { text: '출장', value: 'ADC013' },
]

// 시간 필드 표시 여부 계산
const shouldShowTimeFields = computed(() => {
  const selectedType = attendanceTypeList.find(item => item.text === selectedAttdTypeText.value)
  return selectedType && (selectedType.value === 'ADC001' || selectedType.value === 'ADC003')
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  const currentDay = new Date(startDate)

  for (let i = 0; i < 42; i++) {
    const year = currentDay.getFullYear()
    const monthNum = currentDay.getMonth()
    const month = String(monthNum + 1).padStart(2, '0')
    const day = String(currentDay.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`

    const dayData = {
      date: new Date(currentDay),
      isCurrentMonth: monthNum === currentDate.value.getMonth(),
      isToday: currentDay.toDateString() === new Date().toDateString(),
      dateString: dateString,
    }

    days.push(dayData)
    currentDay.setDate(currentDay.getDate() + 1)
  }

  return days
})

const changeMonth = (direction) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + direction)
  currentDate.value = newDate
  
  // 월이 변경되면 자동으로 조회 (헤더에서 사원이 선택되어 있을 때)
  if (headerSelectedEmp.value) {
    fetchAttendanceData()
  }
}

// 헤더 사원 변경 시 자동 조회
const onHeaderEmpChange = (newEmpCode) => {
  if (newEmpCode) {
    fetchAttendanceData()
  } else {
    // 사원 선택 해제시 데이터 초기화
    attendanceData.value = {}
  }
}

// const empCode = userStore.empCode
// console.log('pinia:',userStore.empCode)
console.log('스토어의 empCode:', userStore.empCode)
// 근태 데이터 조회 (헤더에서 선택한 사원 기준)
const fetchAttendanceData = async () => {
  if (!
  //headerSelectedEmp.value
 userStore.empCode ) {
    alert('조회할 사원을 먼저 선택해주세요.')
    return
  }

  try {
    const year = currentDate.value.getFullYear()
    const month = String(currentDate.value.getMonth() + 1).padStart(2, '0')
    const applyMonth = `${year}-${month}`

    const params = {
      params: {
        //empCode: headerSelectedEmp.value,
        empCode: userStore.empCode,
        month: applyMonth,
      }
    }
    
    const res = await axios.get('http://localhost:8282/hr/attendance/findMonthlyData', {
      params: {
        //empCode: headerSelectedEmp.value,
        empCode: userStore.empCode,
        month: applyMonth,
      }
    })
    console.log('empCode', params.params.empCode);
    console.log('month',params.month);
    console.log('API 응답:', res.data)
    
    attendanceData.value = res.data;

    const list = res.data.attendances || []
    const map = {}
    
    for (const att of list) {
      const dateStr = att.applyDay
      
      // DB 데이터를 화면에서 사용하는 형식으로 변환
      map[dateStr] = {
        type: att.attdTypeCode,
        checkIn: att.startTime || att.checkIn,
        checkOut: att.endTime || att.checkOut,
        status: att.status || 'pending',
        reason: att.reason || '',
        date: dateStr
      }
    }

    console.log('변환된 데이터:', map)
    attendanceData.value = map
  } catch (e) {
    console.error('근태 조회 실패', e)
    alert('근태 정보를 불러오지 못했습니다.')
  }
}

// 날짜 클릭 시 모달 열기
const onDateClick = (dateString) => {
  selectedDate.value = dateString
  const data = attendanceData.value[dateString] || { type: 'work', checkIn: '', checkOut: '', reason: '' }
  formData.value = { ...data }
  
  // 기존 데이터가 있을 때 선택된 근태 유형 설정
  if (attendanceData.value[dateString]) {
    const existingType = attendanceTypeList.find(t => t.value === attendanceData.value[dateString].type)
    selectedAttdTypeText.value = existingType ? existingType.text : ''
    // 기존 데이터가 있으면 해당 사원을 모달에서 선택
    modalSelectedEmp.value = headerSelectedEmp.value
  } else {
    selectedAttdTypeText.value = '근무' // 기본값
    // 새로운 데이터 입력시 헤더에서 선택한 사원을 기본값으로 설정
    modalSelectedEmp.value = headerSelectedEmp.value
  }
  
  showModal.value = true
}

// 모달 닫기
const closeModal = () => {
  showModal.value = false
  selectedDate.value = null
  selectedAttdTypeText.value = ''
  modalSelectedEmp.value = ''
  formData.value = { type: 'work', checkIn: '', checkOut: '', reason: '' }
}

// 근태 저장 (모달에서 선택한 사원 기준)
const saveAttendance = async () => {
  if (!selectedAttdTypeText.value || !modalSelectedEmp.value) {
    alert('모든 항목을 입력해주세요.')
    return
  }

  // 선택된 텍스트에 해당하는 값 찾기
  const selectedType = attendanceTypeList.find(item => item.text === selectedAttdTypeText.value)
  if (!selectedType) {
    alert('유효한 근태 유형을 선택해주세요.')
    return
  }

  // 근무나 조퇴인 경우 시간 체크
  if ((selectedType.value === 'ADC001' || selectedType.value === 'ADC003') && 
      (!formData.value.checkIn || !formData.value.checkOut)) {
    alert('출근 시간과 퇴근 시간을 입력해주세요.')
    return
  }

  const dayAttd = {
    empCode: modalSelectedEmp.value,
    applyDay: selectedDate.value,
    attdTypeCode: selectedType.value,
    attdTypeName: selectedType.text,
    time: `${formData.value.checkIn} ~ ${formData.value.checkOut}`,
    reason: formData.value.reason || ''
  }

  console.log('선택된 날짜:', selectedDate.value)
  console.log('전송할 데이터:', dayAttd)

  try {
    await axios.post('http://localhost:8282/hr/attendance/dayAttendance', dayAttd)
    
    // 성공시 로컬 데이터 업데이트
    attendanceData.value[selectedDate.value] = {
      ...formData.value,
      type: selectedType.value,
      date: selectedDate.value,
      status: 'pending'
    }
    
    closeModal()
    
    // 저장 후 헤더에서 선택한 사원과 동일한 사원이면 데이터 새로고침
    if (headerSelectedEmp.value === modalSelectedEmp.value) {
      fetchAttendanceData()
    }
    
    alert('저장되었습니다.')
  } catch (e) {
    console.error(e)
    alert('저장 실패')
  }
}

// 근태 삭제
const deleteAttendance = async () => {
  if (!selectedDate.value) return

  try {
    // 삭제 API 호출 (실제 API 엔드포인트에 맞게 수정)
    await axios.delete(`http://localhost:8282/hr/attendance/dayAttendance/${selectedDate.value}`, {
      params: { empCode: modalSelectedEmp.value }
    })
    
    // 로컬 데이터에서 삭제
    delete attendanceData.value[selectedDate.value]
    closeModal()
    alert('삭제되었습니다.')
  } catch (e) {
    console.error(e)
    alert('삭제 실패')
  }
}

// 색상 관련 함수들
const getAttendanceColor = (type) => {
  const colors = {
    'ADC001': 'success',    // 근무
    'ADC002': 'info',       // 휴가
    'ADC003': 'error',      // 조퇴
    'ADC007': 'secondary',  // 병가
    'ASC005': 'warning',    // 연차
    'ADC013': 'primary'     // 출장
  }
  return colors[type] || 'grey'
}

const getAttendanceLabel = (type) => {
  const typeObj = attendanceTypeList.find(t => t.value === type)
  return typeObj ? typeObj.text : type
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error'
  }
  return colors[status] || 'grey'
}

// 사원 목록 조회
const fetchEmpList = async () => {
  try {
    const res = await axios.get('http://localhost:8282/hr/attendance/findEmpListByDept')
    emp_list.value = res.data.empList.map(e => ({ value: e.empCode, text: e.empName }))
  } catch (e) {
    console.error(e)
    alert('사원 목록을 불러오지 못했습니다.')
  }
}

onMounted(() => {
    fetchEmpList()

  //     if (userStore.inOutSide !== 'i') {
  //   showMessage('일근태 달력에 접근할 권한이 없습니다.', 'error')
  //  // router.push('/') // 또는 메인페이지 등 접근 허용된 곳으로 보냄
  //   return
  // }

  // 여기가 접근 허용된 경우 실행할 영역
  if (userStore.empCode) {
    fetchAttendanceData()
  }

  watch(() => userStore.empCode, (newVal) => {
    if (newVal) {
      fetchAttendanceData()
    }
  })


  //     if (userStore.empCode) {
  //   fetchAttendanceData()
  // }

  // // empCode가 나중에 세팅될 경우 감시
  // watch(() => userStore.empCode, (newVal) => {
  //   if (newVal) {
  //     fetchAttendanceData()
  //   }
  // })
  //   if (userStore.empCode) {
  //   fetchAttendanceData(userStore.empCode)
  // } else {
  //   console.warn('❌ empCode가 아직 세팅되지 않았습니다.')
  // }
})
</script>

<style scoped>
.attendance-calendar {
  max-width: 1200px;
  margin: 0 auto;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 1px;
}

.day-header {
  padding: 12px;
  text-align: center;
  font-weight: bold;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
}

.day-header.sunday {
  color: #f44336;
}

.day-header.saturday {
  color: #2196f3;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.calendar-day {
  min-height: 120px;
  padding: 8px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.calendar-day:hover {
  background-color: #f5f5f5;
}

.calendar-day.other-month {
  background-color: #fafafa;
  color: #9e9e9e;
}

.calendar-day.today {
  background-color: #e3f2fd;
  border: 2px solid #2196f3;
}

.calendar-day.has-attendance {
  background-color: #f9f9f9;
}

.calendar-day.sunday .day-number {
  color: #f44336;
}

.calendar-day.saturday .day-number {
  color: #2196f3;
}

.day-number {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
}

.attendance-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-grow: 1;
}

.attendance-details {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.time-info {
  font-size: 11px;
  color: #666;
  background-color: #f0f0f0;
  padding: 2px 4px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .calendar-day {
    min-height: 80px;
    padding: 4px;
  }
  
  .day-number {
    font-size: 14px;
  }
  
  .time-info {
    font-size: 10px;
  }
}
</style>
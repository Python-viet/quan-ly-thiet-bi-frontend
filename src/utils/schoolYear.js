export const getCurrentSchoolYear = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

export const generateSchoolYears = (date = new Date()) => {
  const [currentStart, currentEnd] = getCurrentSchoolYear(date).split('-').map(Number);

  // Có sẵn năm học kế tiếp để nhà trường chuẩn bị dữ liệu trước khi năm học bắt đầu.
  return [
    `${currentStart + 1}-${currentEnd + 1}`,
    `${currentStart}-${currentEnd}`,
    `${currentStart - 1}-${currentEnd - 1}`
  ];
};

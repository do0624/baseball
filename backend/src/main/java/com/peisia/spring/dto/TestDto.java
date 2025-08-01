package com.peisia.spring.dto;

import lombok.Data;


@Data // Lombok에서 자동으로 getter, setter, toString, equals, hashCode, 생성자 등을 생성해주는 기능
public class TestDto {
	private Long num;
	private String str_data;
}	
	
//롬복 라이브러리가 아래 게터함수, 세터함수를 자동으로 만들어줌. @Data 라고 붙이면.
	
// Getter
//public Long getNo() {
//    return no;
//}

//public String getStr_data() {
//    return str_data;
//}

// Setter
//public void setStr_data(String str_data) {
//    this.str_data = str_data;
//}

// toString
//@Override
//public String toString() {
//    return "TestDto(no=" + no + ", str_data=" + str_data + ")";
//}

// equals
//@Override
//public boolean equals(Object o) {
//    if (this == o) return true;
//    if (o == null || getClass() != o.getClass()) return false;
//    TestDto testDto = (TestDto) o;
//    return Objects.equals(no, testDto.no) &&
//           Objects.equals(str_data, testDto.str_data);
//}

// hashCode
//@Override
//public int hashCode() {
//    return Objects.hash(no, str_data);
//}

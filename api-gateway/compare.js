//Thuật toán

const compare = (code1, code2) => {
    // Hàm để trích xuất mảng từ chuỗi
    const extractArray = (str) => {
        // Tìm tất cả các số trong chuỗi
        const numbers = str.match(/\d+/g);
        return numbers ? numbers.map(Number) : [];
    };

    // Hàm để so sánh hai mảng
    const areArraysEqual = (arr1, arr2) => {
        if (arr1.length !== arr2.length) return false;
        return arr1.every((val, index) => val === arr2[index]);
    };

    // Trích xuất mảng từ cả hai chuỗi
    const array1 = extractArray(code1);
    const array2 = extractArray(code2);

    // So sánh và trả về kết quả
    const result = areArraysEqual(array1, array2);
    console.log(`So sánh: ${code1} với ${code2}`);
    console.log(`Kết quả: ${result}`);
    return result;
};

// Kiểm thử
const code1 = "30 lần lặp";
const code2 = "đã tìm thấy 2 sau 30 lần lặp của vòng for";
const code3 = "Mảng đã sắp xếp [1, 2, 3, 4, 5]";
const code4 = "[1,2,3,4,6]";  // Mảng khác để test

compare(code2, code1);  // true
// compare(code1, code3);  // true
// compare(code1, code4);  // false

// CSDL

// const compare = (code1, code2) => {
//     // Hàm để trích xuất dữ liệu từ chuỗi output SQL
//     const extractData = (str) => {
//         // Tìm tất cả các dòng dữ liệu có format: số|text|số|text
//         const rows = str.match(/\d+\|[^|]+\|\d+\|[^|]+/g);
//         if (!rows) return [];
        
//         // Chuẩn hóa từng dòng bằng cách loại bỏ khoảng trắng thừa
//         return rows.map(row => row.split('|').map(item => item.trim()));
//     };

//     // Hàm để so sánh hai mảng kết quả
//     const areResultsEqual = (result1, result2) => {
//         if (result1.length !== result2.length) return false;
//         return result1.every((row, i) => 
    //             row.length === result2[i].length && 
    //             row.every((val, j) => val === result2[i][j])
//         );
//     };

//     // Trích xuất dữ liệu từ cả hai chuỗi
//     const data1 = extractData(code1);
//     const data2 = extractData(code2);

//     // So sánh và trả về kết quả
//     const result = areResultsEqual(data1, data2);
//     console.log(`So sánh:\n${code1}\nvới\n${code2}`);
//     console.log(`Kết quả: ${result}`);
//     return result;
// };

// // Ví dụ sử dụng:
// const output1 = "1|John Doe|4000|IT\n3|Alice Smith|5000|IT";
// const output2 = "1|John Doe|4000|IT\n3|Alice Smith| 5000 |IT";
// const output3 = "1|John Doe|4000|IT\n3|Alice Smith| 5000 |IT ";  // có thêm khoảng trắng

// compare(output1, output2);  // true
// compare(output1, output3);  // true

// OOP

// const compare = (code1, code2) => {
//     // Hàm để trích xuất thông tin từ output
//     const extractBarkInfo = (str) => {
//         // Tìm tên và tiếng sủa trong chuỗi output
//         const match = str.match(/(.+) is barking: (.+)!/);
//         if (!match) return null;
//         return {
//             name: match[1].trim(),
//             sound: match[2].trim()
//         };
//     };

//     // Hàm để so sánh hai kết quả
//     const areBarkingEqual = (result1, result2) => {
//         if (!result1 || !result2) return false;
//         return result1.name === result2.name && 
//                result1.sound === result2.sound;
//     };

//     // Trích xuất thông tin từ cả hai chuỗi
//     const data1 = extractBarkInfo(code1);
//     const data2 = extractBarkInfo(code2);

//     // So sánh và trả về kết quả
//     const result = areBarkingEqual(data1, data2);
//     console.log(`So sánh:\n${code1}\nvới\n${code2}`);
//     console.log(`Kết quả: ${result}`);
//     return result;
// };

// // Ví dụ sử dụng:
// const output1 = "Buddy is barking: Woof!";
// const output2 = "Buddy is barking: Woof! ";  // có khoảng trắng
// const output3 = "Max is barking: Woof!";     // tên khác

// compare(output1, output2);  // true
// compare(output1, output3);  // false
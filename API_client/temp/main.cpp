#include <iostream>
using namespace std;

int main() {
    cout << "Chương trình tính tổng mảng\n";
    int n;
    cout << "Nhập số lượng phần tử: ";
    cin >> n;

    int arr[100];
    int total = 0;

    cout << "Nhập " << n << " phần tử:\n";
    for(int i = 0; i < n; i++) {
        cout << "Nhập phần tử thứ " << (i+1) << ": ";
        cin >> arr[i];
        total += arr[i];
    }

    cout << "\nMảng của bạn: ";
    for(int i = 0; i < n; i++) {
        cout << arr[i] << " ";
    }
    cout << "\nTổng các phần tử: " << total << endl;
    return 0;
}
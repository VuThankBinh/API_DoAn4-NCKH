import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Chương trình tính tổng mảng");

        System.out.print("Nhập số lượng phần tử: ");
        int n = scanner.nextInt();

        System.out.println("Nhập " + n + " phần tử:");
        int[] arr = new int[n];
        int total = 0;

        for(int i = 0; i < n; i++) {
            System.out.print("Nhập phần tử thứ " + (i+1) + ": ");
            arr[i] = scanner.nextInt();
            total += arr[i];
        }

        System.out.print("\nMảng của bạn: ");
        for(int num : arr) {
            System.out.print(num + " ");
        }
        System.out.println("\nTổng các phần tử: " + total);
    }
}
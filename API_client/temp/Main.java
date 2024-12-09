import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        @SuppressWarnings("resource")
        Scanner scanner = new Scanner(System.in);
        System.out.println("Program to calculate the sum of an array");

        System.out.print("Input array length: ");
        int n = scanner.nextInt();

        System.out.println("Input " + n + " elements:");
        int[] arr = new int[n];
        int total = 0;

        for(int i = 0; i < n; i++) {
            System.out.print("Input element " + (i+1) + ": ");
            arr[i] = scanner.nextInt();
            total += arr[i];
        }

        System.out.print("\nYour array: ");
        for(int num : arr) {
            System.out.print(num + " ");
        }
        System.out.println("\nSum of elements: " + total);
    }
}
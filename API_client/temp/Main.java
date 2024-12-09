import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        @SuppressWarnings("resource")
        Scanner scanner = new Scanner(System.in);
        System.out.println("Sum of array");

        System.out.print("Enter the number of elements: ");
        int n = scanner.nextInt();

        System.out.println("Enter " + n + " elements:");
        int[] arr = new int[n];
        int total = 0;

        for(int i = 0; i < n; i++) {
            System.out.print("Enter element " + (i+1) + ": ");
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

using System;

class Program {
    static void Main() {
        Console.WriteLine("Chương trình tính tổng mảng");
        Console.Write("Nhập số lượng phần tử: ");
        int n = int.Parse(Console.ReadLine());

        int[] arr = new int[n];
        int total = 0;

        Console.WriteLine($"Nhập {n} phần tử:");
        for(int i = 0; i < n; i++) {
            Console.Write($"Nhập phần tử thứ {i+1}: ");
            arr[i] = int.Parse(Console.ReadLine());
            total += arr[i];
        }

        Console.Write("\nMảng của bạn: ");
        Console.WriteLine(string.Join(" ", arr));
        Console.WriteLine($"Tổng các phần tử: {total}");
    }
}
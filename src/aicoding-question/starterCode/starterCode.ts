export interface StarterCodeTypes {
  javascript: string;
  typescript: string;
  csharp: string;
  python: string;
  php: string;
}

export const starterCode: StarterCodeTypes = {
  javascript: `process.stdin.resume();
  process.stdin.setEncoding('ascii');
  var input_stdin = "";
  var input_stdin_array = "";
  var input_currentline = 0;
  process.stdin.on('data', function (data) {
      input_stdin += data;
  });
  process.stdin.on('end', function () {
      input_stdin_array = input_stdin.split(",");
      main();
  });
  function readLine() {
      return input_stdin_array[input_currentline++];
  }
  // 1. Write Your function body below
  function YourFuntionName() {
      // write your solution code here
  }
  function main() {
  // 2. Write the logic here to test YourFunctionName inside main() body
  // 3. After writing remove the comments 1, 2, 3
  }`,

  typescript: `process.stdin.resume();
  process.stdin.setEncoding('utf-8');
  let input_stdin: string = "";
  let input_stdin_array: string[] = [];
  let input_currentline: number = 0;
  process.stdin.on('data', function (data: string) {
      input_stdin += data;
  });
  process.stdin.on('end', function () {
      input_stdin_array = input_stdin.split(",");
      main();
  });
  function readLine(): string {
      return input_stdin_array[input_currentline++];
  }
  // 1. Write Your function body below
  function YourFunctionName(): number {
  }
  function main(): void {
  // 2. Write the logic here to test YourFunctionName inside main() body
  // 3. After writing remove the comments 1, 2, 3
  }`,
  csharp: `using System;
  
  class Program
  {
      static void Main()
      {
          string input = GetUserInput();
          int result = UserSolution(input);
          PrintResult(result);
      }
  
      static string GetUserInput()
      {
          return Console.ReadLine();
      }
  
      static int UserSolution(string input)
      {
        // 1. Write Your function body below
      }
  
      static void PrintResult(int result)
      {
          Console.WriteLine(result);
      }
  }
  `,
  python: `def YourFunctionName():
    # write your solution code here
def main():
    inputs = input().strip().split()
    input_str = inputs[0]
    input_char = inputs[1]
    result = YourFunctionName(input_str, input_char)
    print(result)
if __name__ == "__main__":
    main() `,
  php: `<?php
function sum($a, $b) {
    return $a + $b;
}
function main() {
    $input = trim(fgets(STDIN));
    $inputs = explode(" ", $input);
    $num1 = (int)$inputs[0];
    $num2 = (int)$inputs[1];
    $result = sum($num1, $num2);
    echo $result . "\n";
}`,
};

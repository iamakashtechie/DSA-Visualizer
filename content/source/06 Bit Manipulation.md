# Bit Manipulation — LeetCode Patterns (C++)

A curated, pattern-grouped list of problems solvable using **Bit Manipulation**. Problems using the same underlying trick are grouped together so you can internalize the pattern once and reuse it, rather than memorizing solutions individually.

---

## Table of Contents

1. [Group 1: Basic Bit Counting & Checks](#group-1-basic-bit-counting--checks)
2. [Group 2: XOR Properties — Finding Unique/Missing Elements](#group-2-xor-properties--finding-uniquemissing-elements)
3. [Group 3: Bitmask for Subsets / Combinatorics](#group-3-bitmask-for-subsets--combinatorics)
4. [Group 4: Bit-Level Arithmetic (No `+`/`-`/`/` Operators)](#group-4-bit-level-arithmetic-no---operators)
5. [Group 5: Range, Complement & Reversal Tricks](#group-5-range-complement--reversal-tricks)
6. [Group 6: Advanced XOR — Trie on Bits](#group-6-advanced-xor--trie-on-bits)
7. [Core Bit Tricks Cheat Sheet](#core-bit-tricks-cheat-sheet)

---

## Group 1: Basic Bit Counting & Checks

**Underlying trick:** `n & (n-1)` clears the lowest set bit. `n & 1` checks the last bit. These two primitives are the foundation for almost every problem below.

### 1. Number of 1 Bits
**LeetCode:** [191. Number of 1 Bits](https://leetcode.com/problems/number-of-1-bits/)

**Description:** Given an unsigned integer, return the number of `1` bits it has (Hamming weight).

**Approach:** Repeatedly clear the lowest set bit using `n = n & (n-1)` and count how many times you can do it before `n` becomes 0. This is faster than checking all 32 bits because it only loops as many times as there are set bits.

```cpp
class Solution {
public:
    int hammingWeight(uint32_t n) {
        int count = 0;
        while (n) {
            n &= (n - 1);   // clears the lowest set bit
            count++;
        }
        return count;
    }
};
```

**Complexity:** Time `O(k)` where k = number of set bits (worst case `O(32)`), Space `O(1)`.

---

### 2. Counting Bits
**LeetCode:** [338. Counting Bits](https://leetcode.com/problems/counting-bits/)

**Description:** Given `n`, return an array `ans` of length `n+1` where `ans[i]` is the number of `1` bits in `i`, for every `i` from `0` to `n`.

**Approach:** DP + bit trick: `dp[i] = dp[i >> 1] + (i & 1)`. Right-shifting `i` by 1 drops the last bit, so the set-bit count of `i` equals the set-bit count of `i/2` plus whether the last bit was 1.

```cpp
class Solution {
public:
    vector<int> countBits(int n) {
        vector<int> dp(n + 1, 0);
        for (int i = 1; i <= n; i++) {
            dp[i] = dp[i >> 1] + (i & 1);   // reuse previously computed result
        }
        return dp;
    }
};
```

**Complexity:** Time `O(n)`, Space `O(n)` (output array itself).

---

### 3. Power of Two
**LeetCode:** [231. Power of Two](https://leetcode.com/problems/power-of-two/)

**Description:** Given an integer `n`, return `true` if it is a power of two.

**Approach:** A power of two has exactly one set bit (e.g., `1000` in binary). So `n & (n-1)` clears that single bit and must result in `0`. Also guard against `n <= 0`.

```cpp
class Solution {
public:
    bool isPowerOfTwo(int n) {
        if (n <= 0) return false;
        return (n & (n - 1)) == 0;   // true only if exactly one bit is set
    }
};
```

**Complexity:** Time `O(1)`, Space `O(1)`.

---

### 4. Power of Four
**LeetCode:** [342. Power of Four](https://leetcode.com/problems/power-of-four/)

**Description:** Given an integer `n`, return `true` if it is a power of four.

**Approach:** Must first be a power of two (`n & (n-1) == 0`). Additionally, powers of four have their single set bit only at even positions (0-indexed): `1, 4, 16, 64...` → bit positions `0, 2, 4, 6...`. Use mask `0xAAAAAAAA` (bits at all odd positions) — if `n & mask == 0`, the set bit isn't at an odd position, confirming it's a power of four.

```cpp
class Solution {
public:
    bool isPowerOfFour(int n) {
        if (n <= 0) return false;
        bool isPowerOfTwo = (n & (n - 1)) == 0;
        bool atEvenPosition = (n & 0xAAAAAAAA) == 0;  // 0xAAAAAAAA has 1s at odd bit positions
        return isPowerOfTwo && atEvenPosition;
    }
};
```

**Complexity:** Time `O(1)`, Space `O(1)`.

---

## Group 2: XOR Properties — Finding Unique/Missing Elements

**Underlying trick:** `x ^ x = 0` and `x ^ 0 = x`, and XOR is commutative/associative. So XOR-ing a set of numbers cancels out pairs, leaving only the "odd one out" behind.

### 5. Single Number
**LeetCode:** [136. Single Number](https://leetcode.com/problems/single-number/)

**Description:** Every element in the array appears twice except for one. Find that single one, in linear time and O(1) space.

**Approach:** XOR all elements together. Every duplicate pair cancels to `0`, leaving only the unique element.

```cpp
class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int result = 0;
        for (int num : nums) {
            result ^= num;   // duplicates cancel out (x ^ x = 0)
        }
        return result;
    }
};
```

**Complexity:** Time `O(n)`, Space `O(1)`.

---

### 6. Single Number II
**LeetCode:** [137. Single Number II](https://leetcode.com/problems/single-number-ii/)

**Description:** Every element appears **three** times except for one, which appears exactly once. Find it in linear time, O(1) space.

**Approach:** Plain XOR won't work since triplets don't cancel to 0. Instead, count set bits at each bit position across all numbers. If a bit's total count (mod 3) is non-zero, that bit belongs to the unique number, since the triplicated numbers contribute counts that are multiples of 3 at every position.

```cpp
class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int result = 0;
        for (int bit = 0; bit < 32; bit++) {
            int sum = 0;
            for (int num : nums) {
                sum += (num >> bit) & 1;   // count how many numbers have this bit set
            }
            if (sum % 3 != 0) {
                result |= (1 << bit);      // this bit belongs to the unique number
            }
        }
        return result;
    }
};
```

**Complexity:** Time `O(32n) = O(n)`, Space `O(1)`.

---

### 7. Single Number III
**LeetCode:** [260. Single Number III](https://leetcode.com/problems/single-number-iii/)

**Description:** Exactly **two** elements appear once, and every other element appears twice. Find both unique numbers.

**Approach:**
1. XOR everything → result is `a ^ b` (the two unique numbers XORed, since pairs cancel).
2. Find any set bit in `a ^ b` (e.g., the lowest set bit via `x & (-x)`) — this bit must differ between `a` and `b`.
3. Partition all numbers into two groups based on whether that bit is set, and XOR within each group. Duplicates still cancel within their group, isolating `a` in one group and `b` in the other.

```cpp
class Solution {
public:
    vector<int> singleNumber(vector<int>& nums) {
        int xorAll = 0;
        for (int num : nums) xorAll ^= num;   // xorAll = a ^ b

        // isolate the lowest set bit — a distinguishing bit between a and b
        int diffBit = xorAll & (-xorAll);

        int a = 0, b = 0;
        for (int num : nums) {
            if (num & diffBit) a ^= num;      // group where this bit is set
            else b ^= num;                    // group where this bit is unset
        }
        return {a, b};
    }
};
```

**Complexity:** Time `O(n)`, Space `O(1)`.

---

### 8. Missing Number
**LeetCode:** [268. Missing Number](https://leetcode.com/problems/missing-number/)

**Description:** Given an array containing `n` distinct numbers from `0` to `n`, find the one number missing from the range.

**Approach:** XOR all indices `0..n` with all array values. Every present number cancels with its matching index; only the missing number (and the extra index `n`) survives.

```cpp
class Solution {
public:
    int missingNumber(vector<int>& nums) {
        int result = nums.size();          // account for index n up front
        for (int i = 0; i < nums.size(); i++) {
            result ^= i ^ nums[i];         // cancel index i with value nums[i]
        }
        return result;
    }
};
```

**Complexity:** Time `O(n)`, Space `O(1)`.

---

## Group 3: Bitmask for Subsets / Combinatorics

**Underlying trick:** A subset of `n` elements can be represented as an `n`-bit integer, where bit `i` = 1 means "element `i` is included." Iterating `mask` from `0` to `2^n - 1` enumerates every subset.

### 9. Subsets (Bitmask Approach)
**LeetCode:** [78. Subsets](https://leetcode.com/problems/subsets/)

**Description:** Given an array of unique integers, return all possible subsets (the power set).

**Approach:** Instead of backtracking, iterate `mask` from `0` to `2^n - 1`. For each mask, bit `i` tells you whether `nums[i]` belongs to the current subset. This directly maps decision trees (include/exclude) to binary numbers.

```cpp
class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        int n = nums.size();
        vector<vector<int>> res;

        for (int mask = 0; mask < (1 << n); mask++) {   // 2^n masks total
            vector<int> subset;
            for (int i = 0; i < n; i++) {
                if (mask & (1 << i)) {                   // bit i set -> include nums[i]
                    subset.push_back(nums[i]);
                }
            }
            res.push_back(subset);
        }
        return res;
    }
};
```

**Complexity:** Time `O(n · 2^n)`, Space `O(n · 2^n)` for the output (excluding output, auxiliary space is `O(1)`).

---

### 10. Sum of All Subset XOR Totals
**LeetCode:** [1863. Sum of All Subset XOR Totals](https://leetcode.com/problems/sum-of-all-subset-xor-totals/)

**Description:** For every subset of `nums`, compute the XOR of its elements (the "XOR total"), then return the sum of XOR totals across **all** subsets.

**Approach:** There's a neat closed-form trick: each bit position that is set in at least one number ends up set in exactly half of all subset XOR totals (by symmetry of inclusion/exclusion), contributing `(OR of all nums) << (n-1)` to the final answer. Alternatively (shown below, more intuitive), brute force with bitmask enumeration works fine given small constraints.

```cpp
class Solution {
public:
    int subsetXORSum(vector<int>& nums) {
        int n = nums.size();
        int totalSum = 0;

        for (int mask = 0; mask < (1 << n); mask++) {
            int xorTotal = 0;
            for (int i = 0; i < n; i++) {
                if (mask & (1 << i)) {
                    xorTotal ^= nums[i];   // build XOR for this subset
                }
            }
            totalSum += xorTotal;
        }
        return totalSum;
    }

    // O(n) closed-form alternative:
    // int subsetXORSum(vector<int>& nums) {
    //     int orAll = 0;
    //     for (int num : nums) orAll |= num;
    //     return orAll << (nums.size() - 1);
    // }
};
```

**Complexity:** Brute force: Time `O(n · 2^n)`, Space `O(1)`. Closed-form: Time `O(n)`, Space `O(1)`.

---

## Group 4: Bit-Level Arithmetic (No `+`/`-`/`/` Operators)

**Underlying trick:** Addition can be simulated with XOR (sum without carry) and AND+shift (carry propagation). Division can be simulated by repeated subtraction using shifted powers of two.

### 11. Sum of Two Integers
**LeetCode:** [371. Sum of Two Integers](https://leetcode.com/problems/sum-of-two-integers/)

**Description:** Calculate the sum of two integers `a` and `b`, without using the `+` or `-` operators.

**Approach:** `a ^ b` gives the sum ignoring carry. `(a & b) << 1` gives the carry that needs to be added. Repeat this process (feeding the new carry back in) until there's no carry left — this mimics how binary addition works at the hardware level.

```cpp
class Solution {
public:
    int getSum(int a, int b) {
        while (b != 0) {
            int carry = (unsigned int)(a & b) << 1;  // bits where both are 1 produce a carry
            a = a ^ b;                                // sum without carry
            b = carry;                                // carry becomes the new "b" to add
        }
        return a;
    }
};
```

**Complexity:** Time `O(32)` ≈ `O(1)` (bounded by integer width), Space `O(1)`.

---

### 12. Divide Two Integers
**LeetCode:** [29. Divide Two Integers](https://leetcode.com/problems/divide-two-integers/)

**Description:** Divide two integers without using multiplication, division, or the modulo operator. Return the quotient (truncated toward zero).

**Approach:** For each attempt, find the largest multiple of the divisor (as `divisor << shift`) that fits within the remaining dividend, subtract it, and add `1 << shift` to the quotient. This is essentially binary long division — each shift doubles the divisor, letting you subtract large chunks at once instead of one at a time.

```cpp
class Solution {
public:
    int divide(int dividend, int divisor) {
        if (dividend == INT_MIN && divisor == -1) return INT_MAX;  // overflow guard

        long long dvd = labs((long long)dividend);
        long long dvs = labs((long long)divisor);
        long long quotient = 0;

        while (dvd >= dvs) {
            long long temp = dvs, multiple = 1;
            while (dvd >= (temp << 1)) {   // double divisor while it still fits
                temp <<= 1;
                multiple <<= 1;
            }
            dvd -= temp;                   // subtract the largest fitting chunk
            quotient += multiple;
        }

        bool negative = (dividend < 0) ^ (divisor < 0);
        return negative ? -quotient : quotient;
    }
};
```

**Complexity:** Time `O(log^2(n))` (outer loop `O(log n)`, inner doubling `O(log n)`), Space `O(1)`.

---

## Group 5: Range, Complement & Reversal Tricks

**Underlying trick:** Manipulating whole ranges or entire bit patterns at once — shifting until numbers converge, flipping every bit, or reversing bit order.

### 13. Bitwise AND of Numbers Range
**LeetCode:** [201. Bitwise AND of Numbers Range](https://leetcode.com/problems/bitwise-and-of-numbers-range/)

**Description:** Given two integers `left` and `right`, return the bitwise AND of all numbers in the range `[left, right]`.

**Approach:** The AND of a range equals the **common prefix** of `left` and `right` in binary, with all lower (differing) bits zeroed out — because as numbers vary within the range, any bit that differs at some point will be 0 in at least one number. Right-shift both numbers together until they're equal, then shift back.

```cpp
class Solution {
public:
    int rangeBitwiseAnd(int left, int right) {
        int shift = 0;
        while (left != right) {
            left >>= 1;
            right >>= 1;
            shift++;               // count how many bits we dropped
        }
        return left << shift;      // restore the common prefix, rest are 0s
    }
};
```

**Complexity:** Time `O(log n)` (bounded by 32 bits), Space `O(1)`.

---

### 14. Number Complement
**LeetCode:** [476. Number Complement](https://leetcode.com/problems/number-complement/)

**Description:** Given a positive integer, flip all its bits (0→1, 1→0) within its minimal binary representation (no leading-zero flipping) and return the result.

**Approach:** Build a mask of all 1s with the same bit-length as `num` (e.g., `num = 5 = 101` → mask `= 111 = 7`), then XOR `num` with that mask to flip every relevant bit.

```cpp
class Solution {
public:
    int findComplement(int num) {
        int mask = 1;
        // build mask with same bit-length as num, e.g. num=101 -> mask=111
        while (mask < num) {
            mask = (mask << 1) | 1;
        }
        return num ^ mask;   // flips every bit within that range
    }
};
```

**Complexity:** Time `O(log n)`, Space `O(1)`.

---

### 15. Reverse Bits
**LeetCode:** [190. Reverse Bits](https://leetcode.com/problems/reverse-bits/)

**Description:** Reverse the bits of a given 32-bit unsigned integer.

**Approach:** Process each of the 32 bits: extract the lowest bit of `n`, place it into the correct (mirrored) position of the result, then shift both `n` right and the result left.

```cpp
class Solution {
public:
    uint32_t reverseBits(uint32_t n) {
        uint32_t result = 0;
        for (int i = 0; i < 32; i++) {
            result <<= 1;              // make room for the next bit
            result |= (n & 1);         // append n's lowest bit to result
            n >>= 1;                   // move to the next bit of n
        }
        return result;
    }
};
```

**Complexity:** Time `O(32) = O(1)`, Space `O(1)`.

---

## Group 6: Advanced XOR — Trie on Bits

**Underlying trick:** To maximize XOR between pairs, greedily pick the *opposite* bit at each position from the most significant bit downward. A binary trie (each node has a 0-child and 1-child) lets you do this greedy lookup in `O(32)` per query instead of `O(n)`.

### 16. Maximum XOR of Two Numbers in an Array
**LeetCode:** [421. Maximum XOR of Two Numbers in an Array](https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/)

**Description:** Given an integer array `nums`, find the maximum XOR value of `nums[i] ^ nums[j]` over all pairs.

**Approach:** Insert every number into a binary trie, bit by bit from MSB to LSB (32 bits). Then for each number, walk the trie greedily trying to go the *opposite* direction of the current bit at every level (since XOR is maximized when bits differ) — this finds the best XOR partner for that number in `O(32)` instead of comparing against every other number.

```cpp
class Solution {
    struct TrieNode {
        TrieNode* child[2] = {nullptr, nullptr};
    };

    TrieNode* root = new TrieNode();

    void insert(int num) {
        TrieNode* node = root;
        for (int i = 31; i >= 0; i--) {
            int bit = (num >> i) & 1;
            if (!node->child[bit]) node->child[bit] = new TrieNode();
            node = node->child[bit];
        }
    }

    int queryMaxXor(int num) {
        TrieNode* node = root;
        int result = 0;
        for (int i = 31; i >= 0; i--) {
            int bit = (num >> i) & 1;
            int wantedBit = 1 - bit;              // prefer the opposite bit to maximize XOR
            if (node->child[wantedBit]) {
                result |= (1 << i);               // this bit differs -> contributes to XOR
                node = node->child[wantedBit];
            } else {
                node = node->child[bit];          // forced to take the same bit
            }
        }
        return result;
    }

public:
    int findMaximumXOR(vector<int>& nums) {
        for (int num : nums) insert(num);

        int maxXor = 0;
        for (int num : nums) {
            maxXor = max(maxXor, queryMaxXor(num));
        }
        return maxXor;
    }
};
```

**Complexity:** Time `O(32n) = O(n)` for both insertion and querying, Space `O(32n) = O(n)` for the trie nodes.

---

## Core Bit Tricks Cheat Sheet

| Trick | Expression | Use case |
|---|---|---|
| Check if `i`-th bit is set | `(n >> i) & 1` | Reading bits |
| Set the `i`-th bit | `n \| (1 << i)` | Turning a bit on |
| Clear the `i`-th bit | `n & ~(1 << i)` | Turning a bit off |
| Toggle the `i`-th bit | `n ^ (1 << i)` | Flipping a bit |
| Clear lowest set bit | `n & (n - 1)` | Counting set bits, power-of-2 check |
| Isolate lowest set bit | `n & (-n)` | Splitting groups (Single Number III) |
| Check power of two | `n > 0 && (n & (n-1)) == 0` | — |
| XOR self-cancel | `x ^ x = 0`, `x ^ 0 = x` | Finding uniques/missing values |
| All 1s mask (n bits) | `(1 << n) - 1` | Subset enumeration, masking |
| Enumerate all subsets | `for mask in [0, 2^n)` | Bitmask DP / subset generation |

---

### Notes on when to reach for bit manipulation
- **XOR cancellation** → problems about duplicates/uniques/missing values with an O(1) space constraint.
- **Bitmask enumeration** → subset/combination problems, especially when `n` is small (≤ 20) and you want an iterative alternative to backtracking.
- **Bit-by-bit counting (mod k)** → "every element appears k times except one" family.
- **Shift-and-mask arithmetic** → simulating `+`, `-`, `*`, `/` without the actual operators.
- **Binary trie** → maximize/minimize XOR pair problems.
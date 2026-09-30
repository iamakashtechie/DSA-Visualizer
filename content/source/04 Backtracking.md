# Backtracking — Problem Sheet (C++)

All of these share the same skeleton you've already been using for Subsets:

```
choose -> explore (recurse) -> un-choose (backtrack, via push_back/pop_back)
```

What changes between problems is just: what counts as a "choice" at each step, and what the base case / pruning condition is. Grouped below by the underlying recursion pattern rather than by difficulty, since problems in the same group are really the same trick wearing a different costume.

## Table of Contents
1. [Subset Generation (start-index pattern)](#1-subset-generation-start-index-pattern)
2. [Combination Sum Family (target-sum backtracking)](#2-combination-sum-family-target-sum-backtracking)
3. [Combinations (choose k)](#3-combinations-choose-k)
4. [Permutations (used[] pattern)](#4-permutations-used-pattern)
5. [Partitioning (start-index over a string)](#5-partitioning-start-index-over-a-string)
6. [Grid / Board DFS-Backtracking (visited marking)](#6-grid--board-dfs-backtracking-visited-marking)
7. [Position-wise String Building](#7-position-wise-string-building)
8. [Pattern Summary Table](#pattern-summary-table)

---

## 1. Subset Generation (start-index pattern)

The pattern: loop from a `start` index, recurse with `i + 1`, and record **every** node in the recursion tree (not just leaves) since every partial path is itself a valid subset.

### 1. Subsets
**LeetCode:** [78. Subsets](https://leetcode.com/problems/subsets/)

Given an integer array of **distinct** elements, return all possible subsets (the power set).

**Approach:** At each call, first record the current `path` (it's a valid subset), then loop `i` from `start` to the end, including `nums[i]`, recursing with `start = i + 1`, then popping it back out.

```cpp
class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> res;
        vector<int> path;
        backtrack(nums, 0, path, res);
        return res;
    }
private:
    void backtrack(vector<int>& nums, int start, vector<int>& path, vector<vector<int>>& res) {
        // every partial 'path' is itself a valid subset -> record it here, not just at leaves
        res.push_back(path);

        for (int i = start; i < nums.size(); i++) {
            path.push_back(nums[i]);              // choose
            backtrack(nums, i + 1, path, res);     // explore
            path.pop_back();                       // un-choose (backtrack)
        }
    }
};
```

**Time:** `O(n * 2^n)` — 2^n subsets, O(n) to copy each into `res`.
**Space:** `O(n)` recursion depth (excluding output storage).

---

### 2. Subsets II
**LeetCode:** [90. Subsets II](https://leetcode.com/problems/subsets-ii/)

Same as above but `nums` may contain **duplicates**; the result must not contain duplicate subsets.

**Approach:** Sort first so equal values sit next to each other. In the loop, skip a value if it equals the previous one *and* we're still at the same recursion depth (`i > start`) — this stops us from picking the "second 2" when we already skipped the "first 2" at this level.

```cpp
class Solution {
public:
    vector<vector<int>> subsetsWithDup(vector<int>& nums) {
        sort(nums.begin(), nums.end());   // group duplicates together
        vector<vector<int>> res;
        vector<int> path;
        backtrack(nums, 0, path, res);
        return res;
    }
private:
    void backtrack(vector<int>& nums, int start, vector<int>& path, vector<vector<int>>& res) {
        res.push_back(path);
        for (int i = start; i < nums.size(); i++) {
            // skip duplicate values at the SAME recursion depth
            // (i > start, not i > 0 — start is fixed per call, so this only
            // blocks re-picking a value we already tried at this level)
            if (i > start && nums[i] == nums[i - 1]) continue;
            path.push_back(nums[i]);
            backtrack(nums, i + 1, path, res);
            path.pop_back();
        }
    }
};
```

**Time:** `O(n * 2^n)` worst case.
**Space:** `O(n)` recursion depth.

---

## 2. Combination Sum Family (target-sum backtracking)

Same start-index skeleton as Subsets, but now the base case is "remaining target hit 0" instead of "record every node," and whether you pass `i` or `i + 1` to the next call controls whether an element can be reused.

### 3. Combination Sum
**LeetCode:** [39. Combination Sum](https://leetcode.com/problems/combination-sum/)

Given distinct candidates and a target, return all combinations where numbers sum to target. **Each candidate may be reused unlimited times.**

**Approach:** Sort candidates so you can `break` early once `cand[i] > remain`. To allow reuse, recurse passing the **same** index `i`, not `i + 1`.

```cpp
class Solution {
public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end()); // enables early break/pruning
        vector<vector<int>> res;
        vector<int> path;
        backtrack(candidates, target, 0, path, res);
        return res;
    }
private:
    void backtrack(vector<int>& cand, int remain, int start,
                    vector<int>& path, vector<vector<int>>& res) {
        if (remain == 0) { res.push_back(path); return; }

        for (int i = start; i < cand.size(); i++) {
            if (cand[i] > remain) break;          // sorted -> everything after is too big too
            path.push_back(cand[i]);
            // pass i (NOT i + 1): the same element can be reused
            backtrack(cand, remain - cand[i], i, path, res);
            path.pop_back();
        }
    }
};
```

**Time:** Exponential in the worst case — bounded by the number of valid combinations; commonly approximated as `O(n^(T/min_candidate))`.
**Space:** `O(T / min_candidate)` recursion depth.

---

### 4. Combination Sum II
**LeetCode:** [40. Combination Sum II](https://leetcode.com/problems/combination-sum-ii/)

Candidates may contain duplicates, **each can be used at most once**, no duplicate combinations in the output.

**Approach:** Combine the "no reuse" move from Subsets (`i + 1`) with the "skip duplicate at same depth" move from Subsets II.

```cpp
class Solution {
public:
    vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());
        vector<vector<int>> res;
        vector<int> path;
        backtrack(candidates, target, 0, path, res);
        return res;
    }
private:
    void backtrack(vector<int>& cand, int remain, int start,
                    vector<int>& path, vector<vector<int>>& res) {
        if (remain == 0) { res.push_back(path); return; }

        for (int i = start; i < cand.size(); i++) {
            if (cand[i] > remain) break;
            if (i > start && cand[i] == cand[i - 1]) continue; // skip dup at same depth
            path.push_back(cand[i]);
            backtrack(cand, remain - cand[i], i + 1, path, res); // i+1: no reuse
            path.pop_back();
        }
    }
};
```

**Time:** Exponential worst case, pruned heavily by the `break`.
**Space:** `O(target / min_candidate)` recursion depth.

---

### 5. Combination Sum III
**LeetCode:** [216. Combination Sum III](https://leetcode.com/problems/combination-sum-iii/)

Find all combinations of exactly `k` numbers from `1..9` that sum to `n`, each number used at most once.

**Approach:** Same start-index, no-reuse loop, but with two base-case constraints: stop once `path.size() == k`, and prune the loop once the current digit already exceeds the remaining sum.

```cpp
class Solution {
public:
    vector<vector<int>> combinationSum3(int k, int n) {
        vector<vector<int>> res;
        vector<int> path;
        backtrack(k, n, 1, path, res);
        return res;
    }
private:
    void backtrack(int k, int remain, int start, vector<int>& path, vector<vector<int>>& res) {
        if ((int)path.size() == k) {
            if (remain == 0) res.push_back(path);
            return;
        }
        for (int i = start; i <= 9; i++) {
            if (i > remain) break;                 // digits increase, so rest are too big too
            path.push_back(i);
            backtrack(k, remain - i, i + 1, path, res);
            path.pop_back();
        }
    }
};
```

**Time:** `O(C(9, k) * k)` — tiny, fixed search space (at most 9 digits).
**Space:** `O(k)` recursion depth.

---

## 3. Combinations (choose k)

### 6. Combinations
**LeetCode:** [77. Combinations](https://leetcode.com/problems/combinations/)

Return all possible combinations of `k` numbers chosen from `1..n`. No target sum — this is the "pure" version of the start-index pattern with an extra pruning trick.

**Approach:** Same skeleton as Subsets, but stop early in the loop once there aren't enough numbers left to fill the remaining `k - path.size()` slots.

```cpp
class Solution {
public:
    vector<vector<int>> combine(int n, int k) {
        vector<vector<int>> res;
        vector<int> path;
        backtrack(n, k, 1, path, res);
        return res;
    }
private:
    void backtrack(int n, int k, int start, vector<int>& path, vector<vector<int>>& res) {
        if ((int)path.size() == k) { res.push_back(path); return; }

        // prune: if remaining numbers (n - i + 1) can't fill the needed slots, stop early
        for (int i = start; i <= n - (k - (int)path.size()) + 1; i++) {
            path.push_back(i);
            backtrack(n, k, i + 1, path, res);
            path.pop_back();
        }
    }
};
```

**Time:** `O(k * C(n, k))`.
**Space:** `O(k)` recursion depth.

---

## 4. Permutations (used[] pattern)

This is the point where the pattern genuinely changes: order matters, so you can't just move a `start` pointer forward — every unused element is a valid next choice at every position. A `used[]` array replaces the start index.

### 7. Permutations
**LeetCode:** [46. Permutations](https://leetcode.com/problems/permutations/)

Given an array of **distinct** integers, return all possible permutations.

**Approach:** At every position in `path`, loop over *all* indices; skip ones already used. Mark/unmark `used[i]` as you push/pop — this is the `used[]` array equivalent of your `push_back`/`pop_back` backtracking step.

```cpp
class Solution {
public:
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> res;
        vector<int> path;
        vector<bool> used(nums.size(), false);
        backtrack(nums, used, path, res);
        return res;
    }
private:
    void backtrack(vector<int>& nums, vector<bool>& used,
                    vector<int>& path, vector<vector<int>>& res) {
        if (path.size() == nums.size()) {
            res.push_back(path);
            return;
        }
        for (int i = 0; i < nums.size(); i++) {
            if (used[i]) continue;               // element already placed in this path
            used[i] = true;
            path.push_back(nums[i]);
            backtrack(nums, used, path, res);
            path.pop_back();                     // backtrack
            used[i] = false;                      // free it up for other branches
        }
    }
};
```

**Time:** `O(n * n!)`.
**Space:** `O(n)`.

---

### 8. Permutations II
**LeetCode:** [47. Permutations II](https://leetcode.com/problems/permutations-ii/)

`nums` may contain duplicates; no duplicate permutations in the output.

**Approach:** Sort first, then add the classic "skip if same as previous **and** the previous copy isn't currently used" check. The `!used[i-1]` condition is the key part — it forces identical values to only ever be picked in a fixed left-to-right order within a single permutation, which is what actually eliminates the duplicates (just checking `nums[i]==nums[i-1]` isn't enough here, unlike the subset/combination cases, because there's no `start` index to anchor "same depth").

```cpp
class Solution {
public:
    vector<vector<int>> permuteUnique(vector<int>& nums) {
        sort(nums.begin(), nums.end());          // group duplicates
        vector<vector<int>> res;
        vector<int> path;
        vector<bool> used(nums.size(), false);
        backtrack(nums, used, path, res);
        return res;
    }
private:
    void backtrack(vector<int>& nums, vector<bool>& used,
                    vector<int>& path, vector<vector<int>>& res) {
        if (path.size() == nums.size()) {
            res.push_back(path);
            return;
        }
        for (int i = 0; i < nums.size(); i++) {
            if (used[i]) continue;
            // skip duplicate: only allow the FIRST unused copy of an equal value
            // per position. If nums[i-1] is equal but currently NOT used, it means
            // we backtracked past it -> using nums[i] now would produce a permutation
            // identical to one already generated with nums[i-1] in that slot.
            if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;
            used[i] = true;
            path.push_back(nums[i]);
            backtrack(nums, used, path, res);
            path.pop_back();
            used[i] = false;
        }
    }
};
```

**Time:** `O(n * n!)` worst case.
**Space:** `O(n)`.

---

## 5. Partitioning (start-index over a string)

Back to the start-index idea, but now `start` walks along a **string**, and each choice is "where do I end the next cut?" rather than "which array element do I include?"

### 9. Palindrome Partitioning
**LeetCode:** [131. Palindrome Partitioning](https://leetcode.com/problems/palindrome-partitioning/)

Partition a string `s` such that every substring in the partition is a palindrome. Return all such partitions.

**Approach:** At `start`, try every possible end index for the next cut. If `s[start..end]` is a palindrome, take it, recurse from `end + 1`. Base case: `start` reaches the end of the string.

```cpp
class Solution {
public:
    vector<vector<string>> partition(string s) {
        vector<vector<string>> res;
        vector<string> path;
        backtrack(s, 0, path, res);
        return res;
    }
private:
    bool isPalindrome(const string& s, int l, int r) {
        while (l < r) if (s[l++] != s[r--]) return false;
        return true;
    }
    void backtrack(const string& s, int start, vector<string>& path,
                    vector<vector<string>>& res) {
        if (start == (int)s.size()) {
            res.push_back(path);
            return;
        }
        for (int end = start; end < (int)s.size(); end++) {
            if (!isPalindrome(s, start, end)) continue; // prune non-palindromic cuts
            path.push_back(s.substr(start, end - start + 1));
            backtrack(s, end + 1, path, res);
            path.pop_back();
        }
    }
};
```

**Time:** `O(n * 2^n)` worst case (up to 2^n partitions, O(n) per palindrome check/copy). Can be improved to O(n^2) palindrome checks with a precomputed DP table if the palindrome check becomes the bottleneck.
**Space:** `O(n)` recursion depth.

---

### 10. Restore IP Addresses
**LeetCode:** [93. Restore IP Addresses](https://leetcode.com/problems/restore-ip-addresses/)

Given a string of digits, return all valid IP address combinations formed by inserting 3 dots.

**Approach:** Same start-index-over-a-string idea, but the "choice" is fixed to segment lengths 1–3, and each segment must be validated (`<= 255`, no leading zero unless it's just `"0"`). Base case: exactly 4 segments chosen and the whole string consumed.

```cpp
class Solution {
public:
    vector<string> restoreIpAddresses(string s) {
        vector<string> res;
        vector<string> path;
        backtrack(s, 0, path, res);
        return res;
    }
private:
    bool isValid(const string& seg) {
        if (seg.empty() || seg.size() > 3) return false;
        if (seg.size() > 1 && seg[0] == '0') return false; // no leading zero
        return stoi(seg) <= 255;
    }
    void backtrack(const string& s, int start, vector<string>& path, vector<string>& res) {
        if (path.size() == 4) {
            if (start == (int)s.size()) {
                string ip = path[0] + "." + path[1] + "." + path[2] + "." + path[3];
                res.push_back(ip);
            }
            return;
        }
        for (int len = 1; len <= 3 && start + len <= (int)s.size(); len++) {
            string seg = s.substr(start, len);
            if (!isValid(seg)) continue;
            path.push_back(seg);
            backtrack(s, start + len, path, res);
            path.pop_back();
        }
    }
};
```

**Time:** `O(1)` — effectively bounded, at most 3^4 branches regardless of input length.
**Space:** `O(1)` aside from output.

---

## 6. Grid / Board DFS-Backtracking (visited marking)

Here the "choice" is a direction to move (up/down/left/right) or a cell to fill, and "backtrack" means undoing a mutation on shared state (a visited marker, a board cell) rather than popping from a `path` vector.

### 11. Word Search
**LeetCode:** [79. Word Search](https://leetcode.com/problems/word-search/)

Given a grid of characters and a word, determine if the word can be constructed from letters of sequentially adjacent cells.

**Approach:** DFS from every starting cell. Mark a cell visited by temporarily overwriting it (avoids a separate visited matrix), and restore it on the way back up — that overwrite/restore *is* the backtracking step here.

```cpp
class Solution {
public:
    bool exist(vector<vector<char>>& board, string word) {
        int rows = board.size(), cols = board[0].size();
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                if (dfs(board, word, 0, r, c)) return true;
        return false;
    }
private:
    bool dfs(vector<vector<char>>& board, const string& word, int idx, int r, int c) {
        if (idx == (int)word.size()) return true; // matched entire word
        if (r < 0 || c < 0 || r >= (int)board.size() || c >= (int)board[0].size()
            || board[r][c] != word[idx]) return false;

        char temp = board[r][c];
        board[r][c] = '#';                 // mark visited in-place
        bool found = dfs(board, word, idx + 1, r + 1, c) ||
                     dfs(board, word, idx + 1, r - 1, c) ||
                     dfs(board, word, idx + 1, r, c + 1) ||
                     dfs(board, word, idx + 1, r, c - 1);
        board[r][c] = temp;                // backtrack: restore cell
        return found;
    }
};
```

**Time:** `O(rows * cols * 4^L)` where `L` is the word length.
**Space:** `O(L)` recursion depth.

---

### 12. N-Queens
**LeetCode:** [51. N-Queens](https://leetcode.com/problems/n-queens/)

Place `n` queens on an `n x n` board so that no two attack each other. Return all distinct board arrangements.

**Approach:** Place one queen per row, so the "choice" per row is which column to use. Track occupied columns and both diagonals with boolean arrays for O(1) conflict checks instead of rescanning the board.

```cpp
class Solution {
public:
    vector<vector<string>> solveNQueens(int n) {
        vector<vector<string>> res;
        vector<int> queenCol(n, -1);           // queenCol[row] = column of queen in that row
        vector<bool> cols(n, false), diag1(2 * n, false), diag2(2 * n, false);
        backtrack(0, n, queenCol, cols, diag1, diag2, res);
        return res;
    }
private:
    void backtrack(int row, int n, vector<int>& queenCol,
                    vector<bool>& cols, vector<bool>& diag1, vector<bool>& diag2,
                    vector<vector<string>>& res) {
        if (row == n) {
            res.push_back(buildBoard(queenCol, n));
            return;
        }
        for (int col = 0; col < n; col++) {
            int d1 = row - col + n, d2 = row + col;   // normalized diagonal ids
            if (cols[col] || diag1[d1] || diag2[d2]) continue; // conflict, skip
            cols[col] = diag1[d1] = diag2[d2] = true;
            queenCol[row] = col;
            backtrack(row + 1, n, queenCol, cols, diag1, diag2, res);
            cols[col] = diag1[d1] = diag2[d2] = false; // backtrack
            queenCol[row] = -1;
        }
    }
    vector<string> buildBoard(vector<int>& queenCol, int n) {
        vector<string> board(n, string(n, '.'));
        for (int r = 0; r < n; r++) board[r][queenCol[r]] = 'Q';
        return board;
    }
};
```

**Time:** `O(n!)` worst case, heavily pruned in practice by the conflict checks.
**Space:** `O(n)` for the tracking arrays plus recursion depth.

---

### 13. N-Queens II
**LeetCode:** [52. N-Queens II](https://leetcode.com/problems/n-queens-ii/)

Same setup as N-Queens, but just return the **count** of distinct solutions instead of the boards themselves.

**Approach:** Identical recursion — drop the board-building step and let the base case return `1` instead of pushing to a results vector.

```cpp
class Solution {
public:
    int totalNQueens(int n) {
        vector<bool> cols(n, false), diag1(2 * n, false), diag2(2 * n, false);
        return backtrack(0, n, cols, diag1, diag2);
    }
private:
    int backtrack(int row, int n, vector<bool>& cols, vector<bool>& diag1, vector<bool>& diag2) {
        if (row == n) return 1;
        int count = 0;
        for (int col = 0; col < n; col++) {
            int d1 = row - col + n, d2 = row + col;
            if (cols[col] || diag1[d1] || diag2[d2]) continue;
            cols[col] = diag1[d1] = diag2[d2] = true;
            count += backtrack(row + 1, n, cols, diag1, diag2);
            cols[col] = diag1[d1] = diag2[d2] = false;
        }
        return count;
    }
};
```

**Time:** `O(n!)` worst case.
**Space:** `O(n)`.

---

### 14. Sudoku Solver
**LeetCode:** [37. Sudoku Solver](https://leetcode.com/problems/sudoku-solver/)

Fill a 9x9 Sudoku board in-place so it satisfies the standard rules.

**Approach:** Find the next empty cell, try digits `'1'`–`'9'`, check row/column/3x3-box validity, place and recurse. The `bool` return value is what makes this stop as soon as a full solution is found, instead of exploring every possibility — once `solve()` returns `true` from deeper in the recursion, every caller above it short-circuits and stops trying more digits.

```cpp
class Solution {
public:
    void solveSudoku(vector<vector<char>>& board) {
        solve(board);
    }
private:
    bool solve(vector<vector<char>>& board) {
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (board[r][c] != '.') continue;
                for (char d = '1'; d <= '9'; d++) {
                    if (!isValid(board, r, c, d)) continue;
                    board[r][c] = d;                  // place digit
                    if (solve(board)) return true;    // propagate success upward
                    board[r][c] = '.';                // backtrack
                }
                return false; // no digit worked here -> dead end, backtrack further up
            }
        }
        return true; // no empty cells left -> solved
    }
    bool isValid(vector<vector<char>>& board, int r, int c, char d) {
        int boxRow = 3 * (r / 3), boxCol = 3 * (c / 3);
        for (int i = 0; i < 9; i++) {
            if (board[r][i] == d) return false;                          // row
            if (board[i][c] == d) return false;                          // column
            if (board[boxRow + i / 3][boxCol + i % 3] == d) return false; // 3x3 box
        }
        return true;
    }
};
```

**Time:** `O(9^m)` worst case, `m` = number of empty cells (heavily pruned in practice).
**Space:** `O(1)` extra (in-place) + recursion depth up to 81.

---

## 7. Position-wise String Building

Similar shape to Permutations (choose per position, not per index), but here the number of choices at each position is small and fixed rather than "remaining unused elements."

### 15. Letter Combinations of a Phone Number
**LeetCode:** [17. Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/)

Given a string of digits `2-9`, return all letter combinations the digits could represent (like old T9 texting).

**Approach:** Recurse one digit at a time (`idx`), not over array indices. At each digit, loop over its mapped letters, append one, recurse to the next digit, then pop it back off.

```cpp
class Solution {
public:
    vector<string> letterCombinations(string digits) {
        vector<string> res;
        if (digits.empty()) return res;
        vector<string> mapping = {"", "", "abc", "def", "ghi", "jkl",
                                   "mno", "pqrs", "tuv", "wxyz"};
        string path;
        backtrack(digits, 0, mapping, path, res);
        return res;
    }
private:
    void backtrack(const string& digits, int idx, vector<string>& mapping,
                    string& path, vector<string>& res) {
        if (idx == (int)digits.size()) {
            res.push_back(path);
            return;
        }
        string letters = mapping[digits[idx] - '0'];
        for (char ch : letters) {
            path.push_back(ch);
            backtrack(digits, idx + 1, mapping, path, res);
            path.pop_back();
        }
    }
};
```

**Time:** `O(4^n * n)`, `n` = number of digits (up to 4 letters mapped per digit).
**Space:** `O(n)` recursion depth.

---

### 16. Generate Parentheses
**LeetCode:** [22. Generate Parentheses](https://leetcode.com/problems/generate-parentheses/)

Given `n` pairs, generate all combinations of well-formed parentheses.

**Approach:** Track how many `(` and `)` have been used so far instead of an index. You can add `(` whenever `openCount < n`; you can only add `)` when `closeCount < openCount` (otherwise it'd be unmatched). This constraint *is* the pruning — it stops invalid branches before they're ever built, rather than generating everything and filtering.

```cpp
class Solution {
public:
    vector<string> generateParenthesis(int n) {
        vector<string> res;
        string path;
        backtrack(n, 0, 0, path, res);
        return res;
    }
private:
    void backtrack(int n, int openCount, int closeCount, string& path, vector<string>& res) {
        if ((int)path.size() == 2 * n) {
            res.push_back(path);
            return;
        }
        if (openCount < n) {                 // can still open a new bracket
            path.push_back('(');
            backtrack(n, openCount + 1, closeCount, path, res);
            path.pop_back();
        }
        if (closeCount < openCount) {        // can only close if there's an unmatched '('
            path.push_back(')');
            backtrack(n, openCount, closeCount + 1, path, res);
            path.pop_back();
        }
    }
};
```

**Time:** `O(4^n / sqrt(n))` — bounded by the nth Catalan number.
**Space:** `O(n)` recursion depth.

---

## Pattern Summary Table

| # | Problem | LeetCode | Pattern | Core "choice" per step |
|---|---------|----------|---------|------------------------|
| 1 | Subsets | 78 | start-index | include/skip each remaining element |
| 2 | Subsets II | 90 | start-index + dup-skip | same, skip equal value at same depth |
| 3 | Combination Sum | 39 | start-index, reuse allowed | recurse with same `i` |
| 4 | Combination Sum II | 40 | start-index, no reuse + dup-skip | recurse with `i + 1`, skip dup at depth |
| 5 | Combination Sum III | 216 | start-index, fixed size `k` | digit 1–9, stop at size `k` |
| 6 | Combinations | 77 | start-index, pure | any of `1..n`, size `k`, no target |
| 7 | Permutations | 46 | used[] array | any unused element, any position |
| 8 | Permutations II | 47 | used[] + `!used[i-1]` dup-skip | same, guard duplicate ordering |
| 9 | Palindrome Partitioning | 131 | start-index over string | where to end next palindromic cut |
| 10 | Restore IP Addresses | 93 | start-index over string, fixed count | segment length 1–3, 4 segments total |
| 11 | Word Search | 79 | grid DFS, mutate-in-place | 4 directions, mark/unmark visited |
| 12 | N-Queens | 51 | grid DFS, row-by-row | column per row, track diagonals |
| 13 | N-Queens II | 52 | grid DFS, row-by-row | same as above, count only |
| 14 | Sudoku Solver | 37 | grid DFS, cell-by-cell | digit 1–9 per empty cell |
| 15 | Letter Combinations | 17 | position-wise | mapped letters per digit position |
| 16 | Generate Parentheses | 22 | position-wise, counters | `(` if room, `)` if valid to close |

**General takeaway:** almost every one of these is "loop over choices, mutate shared state, recurse, undo the mutation." The variation is entirely in *what* the state is (index pointer, `used[]` array, counters, or the board itself) and *what* the base case / pruning condition looks like.
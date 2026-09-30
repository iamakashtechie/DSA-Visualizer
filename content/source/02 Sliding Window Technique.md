# Sliding Window Technique — LeetCode Problem Set (C++)

Sliding Window is used when you need to find a subarray/substring satisfying some
condition, and shrinking/growing a window incrementally is cheaper than recomputing
from scratch for every start index. Two broad flavors:

- **Fixed-size window** — window size `k` is given, slide it across the array.
- **Variable-size window** — window grows/shrinks based on a condition
  (find the *longest* window that's valid, or the *shortest* window that's valid).

---

## 1. Maximum Average Subarray I
**LeetCode 643** — https://leetcode.com/problems/maximum-average-subarray-i/

Given an integer array `nums` and an integer `k`, find the contiguous subarray of
length `k` that has the maximum average value, and return this value.

**Pattern:** Fixed-size window.

```cpp
class Solution {
public:
    double findMaxAverage(vector<int>& nums, int k) {
        int n = nums.size();

        // Build the first window of size k
        long long windowSum = 0;
        for (int i = 0; i < k; i++) {
            windowSum += nums[i];
        }

        long long maxSum = windowSum;

        // Slide the window: remove leftmost element, add new rightmost element
        for (int i = k; i < n; i++) {
            windowSum += nums[i] - nums[i - k];
            maxSum = max(maxSum, windowSum);
        }

        return (double)maxSum / k;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

## 2. Longest Substring Without Repeating Characters
**LeetCode 3** — https://leetcode.com/problems/longest-substring-without-repeating-characters/

Given a string `s`, find the length of the longest substring without repeating
characters.

**Pattern:** Variable-size window (longest), shrink when a duplicate appears.

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Stores the most recent index at which a character was seen
        unordered_map<char, int> lastSeen;
        int left = 0, maxLen = 0;

        for (int right = 0; right < s.size(); right++) {
            char c = s[right];

            // If c was seen before AND that occurrence is inside the current window,
            // shrink the window by moving left just past that occurrence
            if (lastSeen.count(c) && lastSeen[c] >= left) {
                left = lastSeen[c] + 1;
            }

            lastSeen[c] = right;                 // update last seen index
            maxLen = max(maxLen, right - left + 1);
        }

        return maxLen;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(min(n, charset size))

---

## 3. Minimum Size Subarray Sum
**LeetCode 209** — https://leetcode.com/problems/minimum-size-subarray-sum/

Given an array of positive integers `nums` and a positive integer `target`, return
the minimal length of a contiguous subarray whose sum is `>= target`. If no such
subarray exists, return 0.

**Pattern:** Variable-size window (shortest), shrink while condition still holds.

```cpp
class Solution {
public:
    int minSubArrayLen(int target, vector<int>& nums) {
        int n = nums.size();
        int left = 0;
        long long windowSum = 0;
        int minLen = INT_MAX;

        for (int right = 0; right < n; right++) {
            windowSum += nums[right];            // expand window on the right

            // Shrink from the left as long as the sum condition is still satisfied,
            // trying to find a smaller valid window
            while (windowSum >= target) {
                minLen = min(minLen, right - left + 1);
                windowSum -= nums[left];
                left++;
            }
        }

        return (minLen == INT_MAX) ? 0 : minLen;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

## 4. Longest Repeating Character Replacement
**LeetCode 424** — https://leetcode.com/problems/longest-repeating-character-replacement/

Given a string `s` and an integer `k`, you can replace at most `k` characters in
the string with any other uppercase letter. Return the length of the longest
substring containing the same letter after such replacements.

**Pattern:** Variable-size window (longest) using frequency count of the most
common character in the window.

```cpp
class Solution {
public:
    int characterReplacement(string s, int k) {
        vector<int> freq(26, 0);
        int left = 0, maxFreq = 0, maxLen = 0;

        for (int right = 0; right < s.size(); right++) {
            freq[s[right] - 'A']++;
            // Track the highest frequency of any single character seen so far
            // in the current window (it only ever needs to grow, never shrink,
            // because a stale maxFreq can't make the window invalid again)
            maxFreq = max(maxFreq, freq[s[right] - 'A']);

            int windowSize = right - left + 1;

            // If (window - most frequent char) > k, we'd need more than k
            // replacements to make the window uniform -> shrink it
            if (windowSize - maxFreq > k) {
                freq[s[left] - 'A']--;
                left++;
            }

            maxLen = max(maxLen, right - left + 1);
        }

        return maxLen;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1) (fixed 26-size array)

---

## 5. Permutation in String
**LeetCode 567** — https://leetcode.com/problems/permutation-in-string/

Given two strings `s1` and `s2`, return true if `s2` contains a permutation of
`s1` as a contiguous substring.

**Pattern:** Fixed-size window (size = `s1.length()`) matching character
frequencies.

```cpp
class Solution {
public:
    bool checkInclusion(string s1, string s2) {
        int n1 = s1.size(), n2 = s2.size();
        if (n1 > n2) return false;

        vector<int> need(26, 0), window(26, 0);
        for (char c : s1) need[c - 'a']++;

        // Build the first window of size n1
        for (int i = 0; i < n1; i++) window[s2[i] - 'a']++;
        if (window == need) return true;

        // Slide the window one character at a time
        for (int i = n1; i < n2; i++) {
            window[s2[i] - 'a']++;               // add new char entering window
            window[s2[i - n1] - 'a']--;          // remove char leaving window

            if (window == need) return true;     // frequencies match -> permutation found
        }

        return false;
    }
};
```
**Time:** O(n2 * 26) (vector comparison), effectively O(n2) &nbsp; **Space:** O(1)

---

## 6. Find All Anagrams in a String
**LeetCode 438** — https://leetcode.com/problems/find-all-anagrams-in-a-string/

Given two strings `s` and `p`, return the start indices of all anagrams of `p`
in `s`.

**Pattern:** Fixed-size window (same idea as problem 5, but collect all matches).

```cpp
class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        vector<int> result;
        int n = s.size(), m = p.size();
        if (m > n) return result;

        vector<int> need(26, 0), window(26, 0);
        for (char c : p) need[c - 'a']++;

        for (int i = 0; i < n; i++) {
            window[s[i] - 'a']++;                // extend window to include s[i]

            // Once window exceeds size m, remove the leftmost element
            if (i >= m) {
                window[s[i - m] - 'a']--;
            }

            // Window is exactly size m and its frequency matches p's -> anagram found
            if (i >= m - 1 && window == need) {
                result.push_back(i - m + 1);
            }
        }

        return result;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

## 7. Minimum Window Substring
**LeetCode 76** — https://leetcode.com/problems/minimum-window-substring/

Given strings `s` and `t`, return the minimum window substring of `s` such that
every character in `t` (including duplicates) is included in the window. Return
"" if no such substring exists.

**Pattern:** Variable-size window (shortest), classic "shrink while still valid".

```cpp
class Solution {
public:
    string minWindow(string s, string t) {
        if (s.empty() || t.empty()) return "";

        unordered_map<char, int> need;
        for (char c : t) need[c]++;

        unordered_map<char, int> window;
        int required = need.size();   // number of unique chars that must be satisfied
        int formed = 0;               // number of unique chars currently satisfied

        int left = 0, minLen = INT_MAX, minStart = 0;

        for (int right = 0; right < s.size(); right++) {
            char c = s[right];
            window[c]++;

            // If this char's count now exactly matches what's needed, one more
            // requirement is "formed"
            if (need.count(c) && window[c] == need[c]) {
                formed++;
            }

            // While window satisfies all requirements, try to shrink it from left
            while (formed == required) {
                if (right - left + 1 < minLen) {
                    minLen = right - left + 1;
                    minStart = left;
                }

                char leftChar = s[left];
                window[leftChar]--;
                // Removing this char breaks a requirement -> stop shrinking after this
                if (need.count(leftChar) && window[leftChar] < need[leftChar]) {
                    formed--;
                }
                left++;
            }
        }

        return (minLen == INT_MAX) ? "" : s.substr(minStart, minLen);
    }
};
```
**Time:** O(n + m) &nbsp; **Space:** O(charset size)

---

## 8. Sliding Window Maximum
**LeetCode 239** — https://leetcode.com/problems/sliding-window-maximum/

Given an array `nums` and window size `k`, return an array of the maximum value
in each sliding window as it moves from left to right.

**Pattern:** Fixed-size window using a **monotonic deque** (stores indices,
values decreasing front-to-back).

```cpp
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        deque<int> dq;   // stores indices; nums[dq.front()] is always the current max
        vector<int> result;

        for (int i = 0; i < nums.size(); i++) {
            // Remove indices that have fallen out of the window from the front
            if (!dq.empty() && dq.front() <= i - k) {
                dq.pop_front();
            }

            // Maintain decreasing order: pop smaller values from the back since
            // they can never be the max while nums[i] is still in the window
            while (!dq.empty() && nums[dq.back()] < nums[i]) {
                dq.pop_back();
            }

            dq.push_back(i);

            // Once the first full window is formed, record the max (front of deque)
            if (i >= k - 1) {
                result.push_back(nums[dq.front()]);
            }
        }

        return result;
    }
};
```
**Time:** O(n) — each index pushed/popped at most once &nbsp; **Space:** O(k)

---

## 9. Fruit Into Baskets
**LeetCode 904** — https://leetcode.com/problems/fruit-into-baskets/

You have `fruits[i]` = type of fruit at tree `i`. You have exactly 2 baskets,
each can hold only one type of fruit (unlimited quantity). Return the max number
of fruits you can collect picking from a contiguous run of trees.

**Pattern:** Variable-size window (longest) — equivalent to "longest subarray
with at most 2 distinct values".

```cpp
class Solution {
public:
    int totalFruit(vector<int>& fruits) {
        unordered_map<int, int> basket;   // fruit type -> count in current window
        int left = 0, maxFruits = 0;

        for (int right = 0; right < fruits.size(); right++) {
            basket[fruits[right]]++;

            // More than 2 fruit types in the window -> shrink from left until
            // we're back down to 2 types
            while (basket.size() > 2) {
                basket[fruits[left]]--;
                if (basket[fruits[left]] == 0) {
                    basket.erase(fruits[left]);
                }
                left++;
            }

            maxFruits = max(maxFruits, right - left + 1);
        }

        return maxFruits;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1) (at most 3 keys in map at any time)

---

## 10. Max Consecutive Ones III
**LeetCode 1004** — https://leetcode.com/problems/max-consecutive-ones-iii/

Given a binary array `nums` and an integer `k`, return the maximum number of
consecutive 1's if you can flip at most `k` 0's to 1's.

**Pattern:** Variable-size window (longest), track zero-count inside window.

```cpp
class Solution {
public:
    int longestOnes(vector<int>& nums, int k) {
        int left = 0, zeroCount = 0, maxLen = 0;

        for (int right = 0; right < nums.size(); right++) {
            if (nums[right] == 0) zeroCount++;

            // Too many zeros for our flip budget -> shrink from the left
            // until the window is valid again
            while (zeroCount > k) {
                if (nums[left] == 0) zeroCount--;
                left++;
            }

            maxLen = max(maxLen, right - left + 1);
        }

        return maxLen;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

## 11. Subarray Product Less Than K
**LeetCode 713** — https://leetcode.com/problems/subarray-product-less-than-k/

Given an array of positive integers `nums` and an integer `k`, return the number
of contiguous subarrays where the product of all elements is strictly less
than `k`.

**Pattern:** Variable-size window used for **counting**, not just length.

```cpp
class Solution {
public:
    int numSubarrayProductLessThanK(vector<int>& nums, int k) {
        if (k <= 1) return 0;   // product of positive ints is always >= 1

        int left = 0;
        long long product = 1;
        int count = 0;

        for (int right = 0; right < nums.size(); right++) {
            product *= nums[right];

            // Shrink from the left while product is too big
            while (product >= k) {
                product /= nums[left];
                left++;
            }

            // Every subarray ending at `right` and starting anywhere in
            // [left, right] is valid -> that's (right - left + 1) new subarrays
            count += right - left + 1;
        }

        return count;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

## 12. Maximum Number of Vowels in a Substring of Given Length
**LeetCode 1456** — https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/

Given a string `s` and an integer `k`, return the maximum number of vowel
letters in any substring of `s` with length `k`.

**Pattern:** Fixed-size window.

```cpp
class Solution {
public:
    int maxVowels(string s, int k) {
        auto isVowel = [](char c) {
            return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
        };

        int count = 0;
        // Build first window
        for (int i = 0; i < k; i++) {
            count += isVowel(s[i]);
        }

        int maxCount = count;

        // Slide: add incoming char, remove outgoing char
        for (int i = k; i < s.size(); i++) {
            count += isVowel(s[i]);
            count -= isVowel(s[i - k]);
            maxCount = max(maxCount, count);
        }

        return maxCount;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

## 13. Longest Subarray of 1's After Deleting One Element
**LeetCode 1493** — https://leetcode.com/problems/longest-subarray-of-1s-after-deleting-one-element/

Given a binary array `nums`, return the size of the longest subarray containing
only 1's after deleting exactly one element from it.

**Pattern:** Variable-size window (longest) — essentially "Max Consecutive Ones
III" with `k = 1`, minus 1 for the mandatory deletion.

```cpp
class Solution {
public:
    int longestSubarray(vector<int>& nums) {
        int left = 0, zeroCount = 0, maxLen = 0;

        for (int right = 0; right < nums.size(); right++) {
            if (nums[right] == 0) zeroCount++;

            // Allow at most one zero in the window (that's the element we "delete")
            while (zeroCount > 1) {
                if (nums[left] == 0) zeroCount--;
                left++;
            }

            // Window length minus 1 because exactly one element must be deleted,
            // even if the window happens to be all 1's
            maxLen = max(maxLen, right - left + 1 - 1);
        }

        return maxLen;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

## 14. Frequency of the Most Frequent Element
**LeetCode 1838** — https://leetcode.com/problems/frequency-of-the-most-frequent-element/

Given an array `nums` and an integer `k`, you may increment any element by 1,
at most `k` total increments across all operations. Return the maximum possible
frequency of any element after these operations.

**Pattern:** Sort first, then variable-size window (longest) where the window
represents "all these elements can be raised to `nums[right]` within budget `k`".

```cpp
class Solution {
public:
    int maxFrequency(vector<int>& nums, int k) {
        sort(nums.begin(), nums.end());   // sorting lets us reason about a window
                                           // of elements we raise up to nums[right]
        int left = 0;
        long long budget = 0;    // total increments used to level up window[left..right-1]
        int maxFreq = 1;

        for (int right = 0; right < nums.size(); right++) {
            if (right > 0) {
                // Cost to bring every existing window element up to the new
                // right boundary value: (window size before adding right) * delta
                budget += (long long)(nums[right] - nums[right - 1]) * (right - left);
            }

            // If we've exceeded the operation budget, shrink from the left,
            // refunding the increments that element would have needed
            while (budget > k) {
                budget -= nums[right] - nums[left];
                left++;
            }

            maxFreq = max(maxFreq, right - left + 1);
        }

        return maxFreq;
    }
};
```
**Time:** O(n log n) for sort + O(n) for the window &nbsp; **Space:** O(1) (in-place sort)

---

## Quick Recap — Which Pattern to Reach For

| Signal in the problem | Likely pattern |
|---|---|
| "subarray/substring of length k" | Fixed-size window |
| "longest subarray/substring satisfying X" | Variable-size window, expand + shrink to stay valid |
| "shortest/minimum subarray satisfying X" | Variable-size window, shrink while still valid |
| "count subarrays satisfying X" | Variable-size window, add `right - left + 1` per step |
| "max/min value within every window of size k" | Monotonic deque |
| "at most K distinct" / frequency matching | Hash map or fixed-size frequency array inside the window |
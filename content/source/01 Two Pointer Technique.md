# Two Pointer Technique — LeetCode Problems (C++)

A curated list of LeetCode problems solvable using the **two-pointer** approach, grouped by pattern. Each entry has the problem link, a short description, and a commented C++ solution.

---

## Pattern 1: Opposite-Direction Pointers (converge from both ends)

Used when the array/string is sorted, or when comparing from both ends makes sense.

### 1. [167. Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)
Given a **sorted** array, find two numbers that add up to a target and return their 1-indexed positions.

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        int left = 0, right = numbers.size() - 1;
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) {
                // Found the pair — return 1-indexed positions
                return {left + 1, right + 1};
            } else if (sum < target) {
                left++;  // need a bigger sum, move left pointer right
            } else {
                right--; // need a smaller sum, move right pointer left
            }
        }
        return {}; // no solution found
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

### 2. [125. Valid Palindrome](https://leetcode.com/problems/valid-palindrome/)
Check if a string is a palindrome, ignoring non-alphanumeric characters and case.

```cpp
class Solution {
public:
    bool isPalindrome(string s) {
        int left = 0, right = s.size() - 1;
        while (left < right) {
            // Skip non-alphanumeric characters from both ends
            while (left < right && !isalnum(s[left])) left++;
            while (left < right && !isalnum(s[right])) right--;
            if (tolower(s[left]) != tolower(s[right])) return false;
            left++;
            right--;
        }
        return true;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

### 3. [11. Container With Most Water](https://leetcode.com/problems/container-with-most-water/)
Given heights of vertical lines, find two lines that form a container holding the most water.

```cpp
class Solution {
public:
    int maxArea(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int maxWater = 0;
        while (left < right) {
            int width = right - left;
            int h = min(height[left], height[right]); // limited by shorter wall
            maxWater = max(maxWater, width * h);
            // Move the pointer at the shorter wall — moving the taller one
            // can never increase area since width only shrinks either way
            if (height[left] < height[right]) left++;
            else right--;
        }
        return maxWater;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

### 4. [15. 3Sum](https://leetcode.com/problems/3sum/)
Find all unique triplets in the array that sum to zero.

```cpp
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        vector<vector<int>> result;
        sort(nums.begin(), nums.end()); // sorting enables the two-pointer scan
        int n = nums.size();
        for (int i = 0; i < n - 2; i++) {
            if (nums[i] > 0) break;                       // smallest is positive -> no triplet possible
            if (i > 0 && nums[i] == nums[i - 1]) continue; // skip duplicate anchor
            int left = i + 1, right = n - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    result.push_back({nums[i], nums[left], nums[right]});
                    left++; right--;
                    // skip duplicate values to avoid duplicate triplets
                    while (left < right && nums[left] == nums[left - 1]) left++;
                    while (left < right && nums[right] == nums[right + 1]) right--;
                } else if (sum < 0) {
                    left++;  // need a larger sum
                } else {
                    right--; // need a smaller sum
                }
            }
        }
        return result;
    }
};
```
**Time:** O(n²) &nbsp; **Space:** O(1) extra (excluding output)

---

### 5. [16. 3Sum Closest](https://leetcode.com/problems/3sum-closest/)
Find the triplet whose sum is closest to a given target.

```cpp
class Solution {
public:
    int threeSumClosest(vector<int>& nums, int target) {
        sort(nums.begin(), nums.end());
        int n = nums.size();
        int closestSum = nums[0] + nums[1] + nums[2];
        for (int i = 0; i < n - 2; i++) {
            int left = i + 1, right = n - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                // Update closest sum if current sum is nearer to target
                if (abs(sum - target) < abs(closestSum - target)) closestSum = sum;
                if (sum == target) return sum; // exact match, can't get any closer
                else if (sum < target) left++;
                else right--;
            }
        }
        return closestSum;
    }
};
```
**Time:** O(n²) &nbsp; **Space:** O(1)

---

### 6. [18. 4Sum](https://leetcode.com/problems/4sum/)
Find all unique quadruplets that sum to a given target.

```cpp
class Solution {
public:
    vector<vector<int>> fourSum(vector<int>& nums, int target) {
        vector<vector<int>> result;
        sort(nums.begin(), nums.end());
        int n = nums.size();
        for (int i = 0; i < n - 3; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue; // skip duplicate 1st anchor
            for (int j = i + 1; j < n - 2; j++) {
                if (j > i + 1 && nums[j] == nums[j - 1]) continue; // skip duplicate 2nd anchor
                // use long long to avoid overflow while summing
                long long twoSumTarget = (long long)target - nums[i] - nums[j];
                int left = j + 1, right = n - 1;
                while (left < right) {
                    long long sum = (long long)nums[left] + nums[right];
                    if (sum == twoSumTarget) {
                        result.push_back({nums[i], nums[j], nums[left], nums[right]});
                        left++; right--;
                        while (left < right && nums[left] == nums[left - 1]) left++;
                        while (left < right && nums[right] == nums[right + 1]) right--;
                    } else if (sum < twoSumTarget) {
                        left++;
                    } else {
                        right--;
                    }
                }
            }
        }
        return result;
    }
};
```
**Time:** O(n³) &nbsp; **Space:** O(1) extra

---

### 7. [42. Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/)
Given elevation heights, compute how much rainwater can be trapped.

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                // right side has a taller boundary, so left side is the bottleneck
                if (height[left] >= leftMax) leftMax = height[left];
                else water += leftMax - height[left]; // water trapped above this bar
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

### 8. [977. Squares of a Sorted Array](https://leetcode.com/problems/squares-of-a-sorted-array/)
Given a sorted array (may contain negatives), return squares in sorted order.

```cpp
class Solution {
public:
    vector<int> sortedSquares(vector<int>& nums) {
        int n = nums.size();
        vector<int> result(n);
        int left = 0, right = n - 1;
        // fill result from the back — the largest square always sits at an extreme end
        for (int k = n - 1; k >= 0; k--) {
            int leftSq = nums[left] * nums[left];
            int rightSq = nums[right] * nums[right];
            if (leftSq > rightSq) {
                result[k] = leftSq;
                left++;
            } else {
                result[k] = rightSq;
                right--;
            }
        }
        return result;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(n) for output

---

### 9. [344. Reverse String](https://leetcode.com/problems/reverse-string/)
Reverse a character array in-place.

```cpp
class Solution {
public:
    void reverseString(vector<char>& s) {
        int left = 0, right = s.size() - 1;
        while (left < right) {
            swap(s[left], s[right]);
            left++; right--;
        }
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

## Pattern 2: Same-Direction Pointers (slow / fast, in-place overwrite)

Used for in-place array modification or fast/slow traversal of linked lists.

### 10. [26. Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)
Remove duplicates in-place from a sorted array, return new length.

```cpp
class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        if (nums.empty()) return 0;
        int slow = 0; // slow marks the last confirmed position of a unique element
        for (int fast = 1; fast < nums.size(); fast++) {
            if (nums[fast] != nums[slow]) {
                slow++;
                nums[slow] = nums[fast]; // place newly found unique element
            }
        }
        return slow + 1; // length of the unique portion
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

### 11. [283. Move Zeroes](https://leetcode.com/problems/move-zeroes/)
Move all zeroes to the end while keeping relative order of non-zero elements.

```cpp
class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int slow = 0; // slow tracks the next position to place a non-zero element
        for (int fast = 0; fast < nums.size(); fast++) {
            if (nums[fast] != 0) {
                swap(nums[slow], nums[fast]); // bring non-zero forward, push zero back
                slow++;
            }
        }
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

### 12. [75. Sort Colors](https://leetcode.com/problems/sort-colors/) (Dutch National Flag — 3-pointer variant)
Sort an array of 0s, 1s, and 2s in-place in a single pass.

```cpp
class Solution {
public:
    void sortColors(vector<int>& nums) {
        int low = 0, mid = 0, high = nums.size() - 1;
        // Invariant: [0, low) = 0s, [low, mid) = 1s, (high, end] = 2s
        while (mid <= high) {
            if (nums[mid] == 0) {
                swap(nums[low], nums[mid]);
                low++; mid++;
            } else if (nums[mid] == 1) {
                mid++; // 1 is already in its correct region
            } else {
                swap(nums[mid], nums[high]);
                high--; // don't advance mid — must recheck the swapped-in value
            }
        }
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

### 13. [88. Merge Sorted Array](https://leetcode.com/problems/merge-sorted-array/)
Merge nums2 into nums1 in-place (nums1 has extra trailing space).

```cpp
class Solution {
public:
    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
        int i = m - 1, j = n - 1, k = m + n - 1; // fill nums1 from the back
        while (j >= 0) {
            // place the larger current element at the last free slot
            if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--];
            else nums1[k--] = nums2[j--];
        }
    }
};
```
**Time:** O(m + n) &nbsp; **Space:** O(1)

---

### 14. [350. Intersection of Two Arrays II](https://leetcode.com/problems/intersection-of-two-arrays-ii/)
Return the intersection of two arrays, including duplicates.

```cpp
class Solution {
public:
    vector<int> intersect(vector<int>& nums1, vector<int>& nums2) {
        sort(nums1.begin(), nums1.end());
        sort(nums2.begin(), nums2.end());
        int i = 0, j = 0;
        vector<int> result;
        while (i < nums1.size() && j < nums2.size()) {
            if (nums1[i] < nums2[j]) i++;
            else if (nums1[i] > nums2[j]) j++;
            else {
                result.push_back(nums1[i]); // common element found
                i++; j++;
            }
        }
        return result;
    }
};
```
**Time:** O(n log n + m log m) &nbsp; **Space:** O(1) extra (excluding output)

---

## Pattern 3: Fast & Slow Pointers on Linked Lists

### 15. [141. Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/) (Floyd's algorithm)
Detect if a linked list has a cycle.

```cpp
class Solution {
public:
    bool hasCycle(ListNode *head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next;        // moves 1 step at a time
            fast = fast->next->next;  // moves 2 steps at a time
            if (slow == fast) return true; // pointers met -> cycle exists
        }
        return false; // fast reached the end -> no cycle
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

### 16. [876. Middle of the Linked List](https://leetcode.com/problems/middle-of-the-linked-list/)
Return the middle node of a linked list in one pass.

```cpp
class Solution {
public:
    ListNode* middleNode(ListNode* head) {
        ListNode *slow = head, *fast = head;
        // when fast reaches the end, slow lands exactly at the middle
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        return slow;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

### 17. [19. Remove Nth Node From End of List](https://leetcode.com/problems/remove-nth-node-from-end-of-list/)
Remove the nth node from the end in one pass.

```cpp
class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode dummy(0);
        dummy.next = head;
        ListNode *fast = &dummy, *slow = &dummy;
        // advance fast n steps ahead to create a gap of exactly n nodes
        for (int i = 0; i < n; i++) fast = fast->next;
        while (fast->next) {
            fast = fast->next;
            slow = slow->next;
        }
        // slow now sits just before the node that must be removed
        ListNode* toDelete = slow->next;
        slow->next = slow->next->next;
        delete toDelete;
        return dummy.next;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

### 18. [234. Palindrome Linked List](https://leetcode.com/problems/palindrome-linked-list/)
Check if a linked list reads the same forwards and backwards.

```cpp
class Solution {
public:
    bool isPalindrome(ListNode* head) {
        if (!head || !head->next) return true;

        // Step 1: find the middle using fast/slow pointers
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
        }

        // Step 2: reverse the second half in-place
        ListNode *prev = nullptr, *curr = slow;
        while (curr) {
            ListNode* next = curr->next;
            curr->next = prev;
            prev = curr;
            curr = next;
        }

        // Step 3: compare first half against the reversed second half
        ListNode *left = head, *right = prev;
        while (right) { // right half may be shorter for odd-length lists
            if (left->val != right->val) return false;
            left = left->next;
            right = right->next;
        }
        return true;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

## Pattern 4: Sliding Window (a two-pointer variant with a shrinking/expanding window)

### 19. [209. Minimum Size Subarray Sum](https://leetcode.com/problems/minimum-size-subarray-sum/)
Find the minimal length of a contiguous subarray whose sum ≥ target.

```cpp
class Solution {
public:
    int minSubArrayLen(int target, vector<int>& nums) {
        int left = 0, sum = 0, minLen = INT_MAX;
        for (int right = 0; right < nums.size(); right++) {
            sum += nums[right]; // expand window on the right
            // shrink window from the left while it still satisfies the target
            while (sum >= target) {
                minLen = min(minLen, right - left + 1);
                sum -= nums[left];
                left++;
            }
        }
        return minLen == INT_MAX ? 0 : minLen;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1)

---

### 20. [3. Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)
Find the length of the longest substring without repeating characters.

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> lastSeen(256, -1); // last index at which each char was seen
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.size(); right++) {
            // if this char repeats inside the current window, shrink from the left
            if (lastSeen[s[right]] >= left) {
                left = lastSeen[s[right]] + 1;
            }
            lastSeen[s[right]] = right;
            maxLen = max(maxLen, right - left + 1);
        }
        return maxLen;
    }
};
```
**Time:** O(n) &nbsp; **Space:** O(1) (fixed-size 256 array)

---

## Quick Reference Table

| # | Problem | Pattern | Difficulty |
|---|---------|---------|------------|
| 167 | Two Sum II | Opposite-direction | Medium |
| 125 | Valid Palindrome | Opposite-direction | Easy |
| 11 | Container With Most Water | Opposite-direction | Medium |
| 15 | 3Sum | Opposite-direction | Medium |
| 16 | 3Sum Closest | Opposite-direction | Medium |
| 18 | 4Sum | Opposite-direction | Medium |
| 42 | Trapping Rain Water | Opposite-direction | Hard |
| 977 | Squares of a Sorted Array | Opposite-direction | Easy |
| 344 | Reverse String | Opposite-direction | Easy |
| 26 | Remove Duplicates from Sorted Array | Same-direction | Easy |
| 283 | Move Zeroes | Same-direction | Easy |
| 75 | Sort Colors | Same-direction (3-ptr) | Medium |
| 88 | Merge Sorted Array | Same-direction | Easy |
| 350 | Intersection of Two Arrays II | Same-direction | Easy |
| 141 | Linked List Cycle | Fast & Slow | Easy |
| 876 | Middle of the Linked List | Fast & Slow | Easy |
| 19 | Remove Nth Node From End | Fast & Slow | Medium |
| 234 | Palindrome Linked List | Fast & Slow | Easy |
| 209 | Minimum Size Subarray Sum | Sliding Window | Medium |
| 3 | Longest Substring Without Repeating Characters | Sliding Window | Medium |

**When to reach for two pointers:** sorted array + target sum, palindrome checks, in-place array partitioning/compaction, linked list cycle/middle/kth-from-end problems, or any "find optimal contiguous window" problem.

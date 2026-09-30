# Binary Search — The Pattern, Not Just "Search a Sorted Array"

Binary search applies whenever you can define a **monotonic predicate** `P(x)` over a search space —
i.e. `P(x)` is `false...false, true...true` (or vice versa) — and you want the boundary. The "search
space" doesn't have to be array indices; it can be a value range, an answer range, or anything ordered.

Two templates cover almost every problem below:

```cpp
// Template A: find leftmost index where predicate becomes true (lo < hi, hi = mid)
int lo = LOW, hi = HIGH;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (predicate(mid)) hi = mid;      // mid could be the answer, look left
    else lo = mid + 1;                 // mid is not good enough, look right
}
// lo == hi == answer

// Template B: find rightmost index where predicate is true (lo < hi, lo = mid, upward-biased mid)
int lo = LOW, hi = HIGH;
while (lo < hi) {
    int mid = lo + (hi - lo + 1) / 2;  // bias UP to avoid infinite loop
    if (predicate(mid)) lo = mid;      // mid is good, try to push further
    else hi = mid - 1;
}
```

Every problem below is tagged with which template (or minor variant) it uses.

---

## 1. Classic Binary Search on a Sorted Array

The baseline pattern: array is sorted, predicate is a direct comparison with target.

### Binary Search
**[LeetCode 704](https://leetcode.com/problems/binary-search/)**

Given a sorted array and a target, return its index or -1.

**Approach:** Textbook binary search — compare `nums[mid]` to target and shrink `[lo, hi]`.

```cpp
int search(vector<int>& nums, int target) {
    int lo = 0, hi = nums.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;   // avoid overflow vs (lo+hi)/2
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}
```
**Time:** O(log n) **Space:** O(1)

---

### Search Insert Position
**[LeetCode 35](https://leetcode.com/problems/search-insert-position/)**

Find the index of target, or the index where it would be inserted to keep the array sorted.

**Approach:** This is `lower_bound` — find the first index where `nums[mid] >= target` (Template A).

```cpp
int searchInsert(vector<int>& nums, int target) {
    int lo = 0, hi = nums.size(); // hi = n, since answer can be "insert at end"
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid; // nums[mid] >= target, mid is a candidate
    }
    return lo;
}
```
**Time:** O(log n) **Space:** O(1)

---

### Find First and Last Position of Element in Sorted Array
**[LeetCode 34](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/)**

Array has duplicates; find the first and last index of target (or `[-1,-1]`).

**Approach:** Two `lower_bound` calls. First occurrence = `lowerBound(target)`. Last occurrence =
`lowerBound(target + 1) - 1` (first index where value exceeds target, minus one).

```cpp
int lowerBound(vector<int>& nums, int target) {
    int lo = 0, hi = nums.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

vector<int> searchRange(vector<int>& nums, int target) {
    int first = lowerBound(nums, target);
    if (first == (int)nums.size() || nums[first] != target) return {-1, -1};
    int last = lowerBound(nums, target + 1) - 1;
    return {first, last};
}
```
**Time:** O(log n) **Space:** O(1)

---

### Single Element in a Sorted Array
**[LeetCode 540](https://leetcode.com/problems/single-element-in-a-sorted-array/)**

Every element appears exactly twice except one; find that one element in O(log n).

**Approach:** Before the single element, pairs align as `(even, odd)` indices with equal values;
after it, the alignment shifts. Force `mid` to be even, then check if its pair is intact — that tells
you which half the single element is in.

```cpp
int singleNonDuplicate(vector<int>& nums) {
    int lo = 0, hi = nums.size() - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (mid % 2 == 1) mid--;              // force mid to even index
        if (nums[mid] == nums[mid + 1])
            lo = mid + 2;                      // pair intact -> single element is to the right
        else
            hi = mid;                          // pair broken -> single element is at mid or left
    }
    return nums[lo];
}
```
**Time:** O(log n) **Space:** O(1)

---

## 2. Binary Search on Rotated Sorted Array

Array isn't fully sorted, but **at least one half around `mid` always is** — that's the invariant
that keeps binary search valid.

### Search in Rotated Sorted Array
**[LeetCode 33](https://leetcode.com/problems/search-in-rotated-sorted-array/)**

Sorted array rotated at an unknown pivot, no duplicates. Find target's index.

**Approach:** At each step, check which half (`[lo, mid]` or `[mid, hi]`) is sorted, then check if
target falls in that half's value range to decide which side to keep.

```cpp
int search(vector<int>& nums, int target) {
    int lo = 0, hi = nums.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;

        if (nums[lo] <= nums[mid]) {           // left half [lo..mid] is sorted
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {                                // right half [mid..hi] is sorted
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}
```
**Time:** O(log n) **Space:** O(1)

---

### Search in Rotated Sorted Array II
**[LeetCode 81](https://leetcode.com/problems/search-in-rotated-sorted-array-ii/)**

Same as above, but duplicates are allowed. Return `true`/`false`.

**Approach:** Identical idea, except when `nums[lo] == nums[mid] == nums[hi]` we genuinely cannot
tell which half is sorted — so just shrink both ends by one and re-check.

```cpp
bool search(vector<int>& nums, int target) {
    int lo = 0, hi = nums.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return true;

        if (nums[lo] == nums[mid] && nums[mid] == nums[hi]) {
            lo++; hi--;                         // ambiguous, shrink both sides
        } else if (nums[lo] <= nums[mid]) {
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return false;
}
```
**Time:** O(log n) average, O(n) worst case (e.g. all duplicates) **Space:** O(1)

---

### Find Minimum in Rotated Sorted Array
**[LeetCode 153](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/)**

Find the minimum element in a rotated sorted array (no duplicates).

**Approach:** Compare `nums[mid]` with `nums[hi]`. If `nums[mid] > nums[hi]`, the minimum must be
strictly to the right; otherwise `mid` itself could be the minimum, so keep it in range (Template A).

```cpp
int findMin(vector<int>& nums) {
    int lo = 0, hi = nums.size() - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] > nums[hi]) lo = mid + 1;   // min is strictly to the right
        else hi = mid;                             // mid could be the min
    }
    return nums[lo];
}
```
**Time:** O(log n) **Space:** O(1)

---

## 3. Peak Finding (Bitonic Structure)

No sortedness required — just a "goes up then down" (or purely local) shape, which is still monotonic
enough for binary search on the *slope*.

### Find Peak Element
**[LeetCode 162](https://leetcode.com/problems/find-peak-element/)**

`nums[-1] = nums[n] = -infinity` conceptually. Return the index of any local peak.

**Approach:** If `nums[mid] < nums[mid+1]`, the slope is rising, so a peak is guaranteed somewhere to
the right. Otherwise a peak is at `mid` or to the left.

```cpp
int findPeakElement(vector<int>& nums) {
    int lo = 0, hi = nums.size() - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < nums[mid + 1]) lo = mid + 1;  // peak is to the right
        else hi = mid;                                 // mid could be the peak
    }
    return lo;
}
```
**Time:** O(log n) **Space:** O(1)

---

### Peak Index in a Mountain Array
**[LeetCode 852](https://leetcode.com/problems/peak-index-in-a-mountain-array/)**

Array strictly increases then strictly decreases (a true "mountain"). Find the peak index.

**Approach:** Same as LC 162, just guaranteed a single unambiguous peak.

```cpp
int peakIndexInMountainArray(vector<int>& arr) {
    int lo = 0, hi = arr.size() - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] < arr[mid + 1]) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}
```
**Time:** O(log n) **Space:** O(1)

---

## 4. Binary Search on the Answer — Minimize the Maximum

This is where binary search stops being about arrays and starts being about **searching a range of
possible answers**, using a feasibility check as the predicate: "can we achieve this in `X` or less?"

### Koko Eating Bananas
**[LeetCode 875](https://leetcode.com/problems/koko-eating-bananas/)**

Koko eats at a constant speed `k` bananas/hour from piles. Find the minimum `k` so she finishes all
piles within `h` hours.

**Approach:** Binary search `k` in `[1, max(piles)]`. Feasibility check: total hours needed at speed
`k` (ceil division per pile) `<= h`. Feasibility is monotonic in `k`, so Template A applies.

```cpp
long long hoursNeeded(vector<int>& piles, int k) {
    long long hours = 0;
    for (int p : piles) hours += (p + k - 1) / k;   // ceil(p / k)
    return hours;
}

int minEatingSpeed(vector<int>& piles, int h) {
    int lo = 1, hi = *max_element(piles.begin(), piles.end());
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (hoursNeeded(piles, mid) <= h) hi = mid;  // feasible, try slower speed
        else lo = mid + 1;                            // too slow, need more speed
    }
    return lo;
}
```
**Time:** O(n · log(max(piles))) **Space:** O(1)

---

### Capacity To Ship Packages Within D Days
**[LeetCode 1011](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/)**

Ship packages (in given order) using a fixed daily capacity. Find the minimum capacity so all ship
within `days`.

**Approach:** Binary search capacity in `[max(weights), sum(weights)]`. Feasibility: greedily pack
each day until the next weight would overflow capacity; count days needed.

```cpp
int daysNeeded(vector<int>& weights, int cap) {
    int days = 1, curr = 0;
    for (int w : weights) {
        if (curr + w > cap) { days++; curr = 0; }    // start a new day
        curr += w;
    }
    return days;
}

int shipWithinDays(vector<int>& weights, int days) {
    int lo = *max_element(weights.begin(), weights.end());
    int hi = accumulate(weights.begin(), weights.end(), 0);
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (daysNeeded(weights, mid) <= days) hi = mid;  // feasible, try smaller capacity
        else lo = mid + 1;
    }
    return lo;
}
```
**Time:** O(n · log(sum(weights))) **Space:** O(1)

---

### Split Array Largest Sum
**[LeetCode 410](https://leetcode.com/problems/split-array-largest-sum/)**

Split array into `m` contiguous subarrays, minimizing the largest subarray sum.

**Approach:** Same template as above — binary search the answer (the largest allowed sum), feasibility
check counts how many pieces are needed to keep every piece `<= mid`.

```cpp
int piecesNeeded(vector<int>& nums, long long maxSum) {
    int pieces = 1; long long curr = 0;
    for (int n : nums) {
        if (curr + n > maxSum) { pieces++; curr = 0; }
        curr += n;
    }
    return pieces;
}

int splitArray(vector<int>& nums, int m) {
    long long lo = *max_element(nums.begin(), nums.end());
    long long hi = accumulate(nums.begin(), nums.end(), 0LL);
    while (lo < hi) {
        long long mid = lo + (hi - lo) / 2;
        if (piecesNeeded(nums, mid) <= m) hi = mid;   // fits in <= m pieces, try smaller sum
        else lo = mid + 1;
    }
    return (int)lo;
}
```
**Time:** O(n · log(sum(nums))) **Space:** O(1)

---

### Book Allocation Problem
**[GFG](https://www.geeksforgeeks.org/dsa/allocate-minimum-number-pages/)**

Allocate books to `m` students (contiguous ranges), minimizing the maximum pages assigned to any
student.

**Approach:** Structurally identical to Split Array Largest Sum — different story, same predicate.

```cpp
int studentsNeeded(vector<int>& pages, int maxPages) {
    int students = 1; long long curr = 0;
    for (int p : pages) {
        if (p > maxPages) return INT_MAX;             // single book too big, infeasible
        if (curr + p > maxPages) { students++; curr = 0; }
        curr += p;
    }
    return students;
}

int findPages(vector<int>& pages, int m) {
    if ((int)pages.size() < m) return -1;              // can't give every student a book
    int lo = *max_element(pages.begin(), pages.end());
    int hi = accumulate(pages.begin(), pages.end(), 0);
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (studentsNeeded(pages, mid) <= m) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}
```
**Time:** O(n · log(sum(pages))) **Space:** O(1)

---

## 5. Binary Search on the Answer — Maximize the Minimum

Mirror image of Group 4: instead of minimizing a max, we maximize a min. The feasibility direction
flips, so we use **Template B** (bias `mid` upward, `lo = mid` on success).

### Aggressive Cows
**[GFG](https://www.geeksforgeeks.org/dsa/aggressive-cows-detailed-solution/)**

Place `c` cows into stalls at given positions, maximizing the minimum distance between any two cows.

**Approach:** Binary search the minimum distance in `[1, max(stalls) - min(stalls)]`. Feasibility:
greedily place cows, always jumping to the next stall that's at least `minDist` away from the last
placed cow; check if `c` cows fit.

```cpp
bool canPlace(vector<int>& stalls, int cows, int minDist) {
    int count = 1, last = stalls[0];              // place first cow at first stall
    for (size_t i = 1; i < stalls.size(); i++) {
        if (stalls[i] - last >= minDist) {
            count++;
            last = stalls[i];
        }
    }
    return count >= cows;
}

int aggressiveCows(vector<int>& stalls, int cows) {
    sort(stalls.begin(), stalls.end());
    int lo = 1, hi = stalls.back() - stalls.front();
    while (lo < hi) {
        int mid = lo + (hi - lo + 1) / 2;          // bias up: we want the largest feasible distance
        if (canPlace(stalls, cows, mid)) lo = mid; // feasible, try to push distance larger
        else hi = mid - 1;
    }
    return lo;
}
```
**Time:** O(n log n + n · log(maxDist)) **Space:** O(1)

---

### Magnetic Force Between Two Balls
**[LeetCode 1552](https://leetcode.com/problems/magnetic-force-between-two-balls/)**

LeetCode's version of Aggressive Cows: place `m` balls in baskets at given positions, maximizing the
minimum magnetic force (distance) between any two balls.

**Approach:** Exact same template as Aggressive Cows.

```cpp
bool canPlace(vector<int>& position, int m, int minDist) {
    int count = 1, last = position[0];
    for (size_t i = 1; i < position.size(); i++) {
        if (position[i] - last >= minDist) {
            count++;
            last = position[i];
        }
    }
    return count >= m;
}

int maxDistance(vector<int>& position, int m) {
    sort(position.begin(), position.end());
    int lo = 1, hi = position.back() - position.front();
    while (lo < hi) {
        int mid = lo + (hi - lo + 1) / 2;
        if (canPlace(position, m, mid)) lo = mid;
        else hi = mid - 1;
    }
    return lo;
}
```
**Time:** O(n log n + n · log(maxDist)) **Space:** O(1)

---

## 6. Binary Search on a 2D Matrix

### Search a 2D Matrix
**[LeetCode 74](https://leetcode.com/problems/search-a-2d-matrix/)**

Matrix sorted row-wise, and each row's first element is greater than the previous row's last element
— meaning the whole matrix is really a **sorted 1D array in disguise**.

**Approach:** Binary search over a virtual flattened array of size `m*n`, mapping a 1D index back to
`(row, col)` with div/mod.

```cpp
bool searchMatrix(vector<vector<int>>& matrix, int target) {
    int m = matrix.size(), n = matrix[0].size();
    int lo = 0, hi = m * n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        int val = matrix[mid / n][mid % n];       // map 1D index -> 2D coordinate
        if (val == target) return true;
        else if (val < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return false;
}
```
**Time:** O(log(m·n)) **Space:** O(1)

---

### Search a 2D Matrix II
**[LeetCode 240](https://leetcode.com/problems/search-a-2d-matrix-ii/)**

Matrix sorted row-wise **and** column-wise independently (not flattenable into one sorted sequence).

**Approach:** Start at the top-right corner. If current `> target`, the whole column can be discarded
(move left); if current `< target`, the whole row can be discarded (move down). This is technically a
"staircase elimination" rather than a strict binary search, but it's the standard answer to this
problem and is commonly grouped with 2D binary-search problems.

```cpp
bool searchMatrix(vector<vector<int>>& matrix, int target) {
    int row = 0, col = matrix[0].size() - 1;       // start top-right
    while (row < (int)matrix.size() && col >= 0) {
        if (matrix[row][col] == target) return true;
        else if (matrix[row][col] > target) col--;  // eliminate this column
        else row++;                                   // eliminate this row
    }
    return false;
}
```
**Time:** O(m + n) **Space:** O(1)

*(A true binary-search alternative exists: run binary search independently on each row → O(m log n), worse than the staircase approach here but useful if the matrix isn't column-sorted.)*

---

## 7. Binary Search Across Two Sorted Structures / Kth Element

Here the predicate is evaluated over an *implicit* combined structure — you never actually merge the
arrays/matrix values, you just count or partition against them.

### Median of Two Sorted Arrays
**[LeetCode 4](https://leetcode.com/problems/median-of-two-sorted-arrays/)**

Find the median of two sorted arrays in O(log(min(m, n))).

**Approach:** Binary search the **partition point** in the smaller array. The partition in the second
array is forced by the first (so that left-half size == right-half size). A partition is valid when
`max(left1, left2) <= min(right1, right2)`.

```cpp
double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    if (nums1.size() > nums2.size()) return findMedianSortedArrays(nums2, nums1); // search smaller array

    int m = nums1.size(), n = nums2.size();
    int lo = 0, hi = m;
    int total = m + n, half = (total + 1) / 2;

    while (lo <= hi) {
        int cut1 = lo + (hi - lo) / 2;           // partition index in nums1
        int cut2 = half - cut1;                   // forced partition index in nums2

        int left1  = (cut1 == 0) ? INT_MIN : nums1[cut1 - 1];
        int right1 = (cut1 == m) ? INT_MAX : nums1[cut1];
        int left2  = (cut2 == 0) ? INT_MIN : nums2[cut2 - 1];
        int right2 = (cut2 == n) ? INT_MAX : nums2[cut2];

        if (left1 <= right2 && left2 <= right1) {          // valid partition
            if (total % 2 == 0)
                return (max(left1, left2) + min(right1, right2)) / 2.0;
            else
                return max(left1, left2);
        } else if (left1 > right2) {
            hi = cut1 - 1;                        // cut1 too far right, move left
        } else {
            lo = cut1 + 1;                        // cut1 too far left, move right
        }
    }
    return 0.0; // unreachable for valid input
}
```
**Time:** O(log(min(m, n))) **Space:** O(1)

---

### Kth Smallest Element in a Sorted Matrix
**[LeetCode 378](https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/)**

Matrix sorted row-wise and column-wise; find the kth smallest element overall.

**Approach:** Binary search on the **value range** `[matrix[0][0], matrix[n-1][n-1]]`, not on indices.
For a candidate value `mid`, count how many matrix elements are `<= mid` using the staircase technique
(same walk as LC 240) in O(n). Narrow the value range until the count matches.

```cpp
int countLessEqual(vector<vector<int>>& matrix, int mid) {
    int n = matrix.size();
    int count = 0, row = n - 1, col = 0;           // start bottom-left
    while (row >= 0 && col < n) {
        if (matrix[row][col] <= mid) {
            count += row + 1;                       // whole column up to `row` qualifies
            col++;
        } else {
            row--;
        }
    }
    return count;
}

int kthSmallest(vector<vector<int>>& matrix, int k) {
    int n = matrix.size();
    int lo = matrix[0][0], hi = matrix[n - 1][n - 1];
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (countLessEqual(matrix, mid) < k) lo = mid + 1;  // not enough elements <= mid
        else hi = mid;                                        // mid could be the answer
    }
    return lo;
}
```
**Time:** O(n · log(max - min)) **Space:** O(1)

---

## 8. Binary Search on Real-Valued / Root-Finding Problems

### Sqrt(x)
**[LeetCode 69](https://leetcode.com/problems/sqrtx/)**

Compute the integer (floor) square root of `x`.

**Approach:** Binary search candidate answers in `[0, x]`; find the largest value whose square is
`<= x` (Template B).

```cpp
int mySqrt(int x) {
    if (x < 2) return x;
    long long lo = 1, hi = x;
    while (lo < hi) {
        long long mid = lo + (hi - lo + 1) / 2;    // bias up: want the largest feasible root
        if (mid * mid <= x) lo = mid;               // feasible, try larger
        else hi = mid - 1;
    }
    return (int)lo;
}
```
**Time:** O(log x) **Space:** O(1)

---

## Quick Reference Table

| # | Problem | Sub-pattern | Search space |
|---|---------|-------------|---------------|
| 1 | Binary Search | Classic | array indices |
| 2 | Search Insert Position | Classic (lower_bound) | array indices |
| 3 | First/Last Position | Classic (two lower_bounds) | array indices |
| 4 | Single Element in Sorted Array | Classic (parity trick) | array indices |
| 5 | Search Rotated Sorted Array | Rotated array | array indices |
| 6 | Search Rotated Sorted Array II | Rotated array + dupes | array indices |
| 7 | Find Min in Rotated Sorted Array | Rotated array | array indices |
| 8 | Find Peak Element | Bitonic/slope | array indices |
| 9 | Peak Index in Mountain Array | Bitonic/slope | array indices |
| 10 | Koko Eating Bananas | Minimize the max | answer range |
| 11 | Ship Within D Days | Minimize the max | answer range |
| 12 | Split Array Largest Sum | Minimize the max | answer range |
| 13 | Book Allocation | Minimize the max | answer range |
| 14 | Aggressive Cows | Maximize the min | answer range |
| 15 | Magnetic Force Between Balls | Maximize the min | answer range |
| 16 | Search a 2D Matrix | 2D → flattened | array indices |
| 17 | Search a 2D Matrix II | 2D staircase | grid position |
| 18 | Median of Two Sorted Arrays | Partition search | array indices |
| 19 | Kth Smallest in Sorted Matrix | Value-range search | value range |
| 20 | Sqrt(x) | Root-finding | value range |
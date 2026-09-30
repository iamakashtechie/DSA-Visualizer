# Greedy Algorithm Problems (C++)

A curated set of classic Greedy problems, grouped by the underlying trick rather than by difficulty. Problems that share the same reasoning pattern are placed together so the pattern becomes obvious across problems.

## Table of Contents

1. [Interval Scheduling — Sort by End Time](#1-interval-scheduling--sort-by-end-time)
   - Non-overlapping Intervals
   - Minimum Number of Arrows to Burst Balloons
   - N Meetings in One Room
2. [Interval Merging — Sort by Start Time](#2-interval-merging--sort-by-start-time)
   - Merge Intervals
   - Insert Interval
3. [Reachability / Same-Direction Scan](#3-reachability--same-direction-scan)
   - Jump Game
   - Jump Game II
   - Gas Station
4. [Sorting + Two-Pointer Pairing](#4-sorting--two-pointer-pairing)
   - Assign Cookies
   - Boats to Save People
   - Two City Scheduling
5. [Monotonic Stack Greedy](#5-monotonic-stack-greedy)
   - Remove Duplicate Letters
   - Remove K Digits
6. [Local Exchange-Argument Greedy](#6-local-exchange-argument-greedy)
   - Candy
   - Partition Labels
   - Task Scheduler
7. [Heap-Based Greedy](#7-heap-based-greedy)
   - IPO
   - Reorganize String

---

## 1. Interval Scheduling — Sort by End Time

**Core idea:** When you must *select* a subset of intervals that don't overlap (and want to maximize count / minimize removals), always sort by **end time**. Picking the interval that finishes earliest leaves the most room for future picks.

### Non-overlapping Intervals
**LeetCode:** https://leetcode.com/problems/non-overlapping-intervals/

Given a list of intervals, find the minimum number of intervals to remove so that the rest don't overlap.

**Approach:** Sort by end time. Greedily keep an interval if its start is ≥ the end of the last kept interval; otherwise it overlaps, so count it for removal.

```cpp
class Solution {
public:
    int eraseOverlapIntervals(vector<vector<int>>& intervals) {
        if (intervals.empty()) return 0;
        // Sort by end time to always keep the interval that frees up earliest
        sort(intervals.begin(), intervals.end(), [](const vector<int>& a, const vector<int>& b) {
            return a[1] < b[1];
        });
        int count = 0;
        int prevEnd = intervals[0][1];
        for (int i = 1; i < intervals.size(); i++) {
            if (intervals[i][0] < prevEnd) {
                // Overlaps with previous kept interval -> remove this one
                count++;
            } else {
                prevEnd = intervals[i][1];
            }
        }
        return count;
    }
};
```
**Time:** O(n log n) — sorting dominates. **Space:** O(1) extra (ignoring sort's internal stack).

---

### Minimum Number of Arrows to Burst Balloons
**LeetCode:** https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/

Balloons are given as `[start, end]` intervals on the x-axis. An arrow shot at position `x` bursts every balloon whose interval contains `x`. Find the minimum arrows needed to burst all balloons.

**Approach:** Sort by end coordinate. Shoot an arrow at the end of the first balloon; it bursts every balloon that overlaps that point. Skip all of them, then repeat from the next non-overlapping balloon.

```cpp
class Solution {
public:
    int findMinArrowShots(vector<vector<int>>& points) {
        if (points.empty()) return 0;
        sort(points.begin(), points.end(), [](const vector<int>& a, const vector<int>& b) {
            return a[1] < b[1];
        });
        int arrows = 1;
        long long arrowPos = points[0][1]; // long long to avoid overflow at INT_MAX bounds
        for (int i = 1; i < points.size(); i++) {
            if (points[i][0] > arrowPos) {
                // This balloon isn't hit by the current arrow -> need a new one
                arrows++;
                arrowPos = points[i][1];
            }
        }
        return arrows;
    }
};
```
**Time:** O(n log n). **Space:** O(1).

---

### N Meetings in One Room
**GfG:** https://www.geeksforgeeks.org/problems/n-meetings-in-one-room-1587115620/1
*(Same problem as LeetCode 252 "Meeting Rooms", which is locked behind LeetCode Premium.)*

Given start and end times of `n` meetings, find the maximum number of meetings a single room can host (no overlaps allowed).

**Approach:** Sort by end time. Greedily attend a meeting if its start time is after the end of the last attended meeting.

```cpp
class Solution {
public:
    int maxMeetings(vector<int>& start, vector<int>& end) {
        int n = start.size();
        vector<pair<int,int>> meetings(n);
        for (int i = 0; i < n; i++) meetings[i] = {end[i], start[i]};
        sort(meetings.begin(), meetings.end()); // sorts by end time (first element of pair)

        int count = 1;
        int lastEnd = meetings[0].first;
        for (int i = 1; i < n; i++) {
            if (meetings[i].second > lastEnd) { // next meeting starts strictly after last ends
                count++;
                lastEnd = meetings[i].first;
            }
        }
        return count;
    }
};
```
**Time:** O(n log n). **Space:** O(n) for the pairs array.

---

## 2. Interval Merging — Sort by Start Time

**Core idea:** When you must *combine* overlapping intervals rather than discard them, sort by **start time** and extend the current interval's end as you scan.

### Merge Intervals
**LeetCode:** https://leetcode.com/problems/merge-intervals/

Given a collection of intervals, merge all overlapping ones.

**Approach:** Sort by start time. Compare each interval to the last merged one — if they overlap, extend the end; otherwise, start a new merged interval.

```cpp
class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> result;
        for (auto& interval : intervals) {
            // If result empty or no overlap with last merged interval, push new
            if (result.empty() || result.back()[1] < interval[0]) {
                result.push_back(interval);
            } else {
                // Overlaps -> extend the end of the last merged interval
                result.back()[1] = max(result.back()[1], interval[1]);
            }
        }
        return result;
    }
};
```
**Time:** O(n log n). **Space:** O(n) for the output (ignoring sort space).

---

### Insert Interval
**LeetCode:** https://leetcode.com/problems/insert-interval/

Given a set of non-overlapping intervals sorted by start time, insert a new interval and merge if necessary.

**Approach:** Three linear passes — add intervals ending before the new one starts, merge all intervals overlapping the new one, then add the rest untouched.

```cpp
class Solution {
public:
    vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
        vector<vector<int>> result;
        int i = 0, n = intervals.size();

        // 1. Add all intervals ending strictly before newInterval starts
        while (i < n && intervals[i][1] < newInterval[0]) {
            result.push_back(intervals[i]);
            i++;
        }
        // 2. Merge all intervals overlapping with newInterval
        while (i < n && intervals[i][0] <= newInterval[1]) {
            newInterval[0] = min(newInterval[0], intervals[i][0]);
            newInterval[1] = max(newInterval[1], intervals[i][1]);
            i++;
        }
        result.push_back(newInterval);

        // 3. Add remaining intervals
        while (i < n) {
            result.push_back(intervals[i]);
            i++;
        }
        return result;
    }
};
```
**Time:** O(n) — input is already sorted, so no sorting needed. **Space:** O(n) for the output.

---

## 3. Reachability / Same-Direction Scan

**Core idea:** A single left-to-right pass while tracking a running "frontier" (farthest reachable index, running fuel, etc.) is enough — no sorting, no backtracking.

### Jump Game
**LeetCode:** https://leetcode.com/problems/jump-game/

`nums[i]` is the max jump length from index `i`. Determine if you can reach the last index starting from index 0.

**Approach:** Track the farthest index reachable so far. If the current index ever exceeds that farthest boundary, it's unreachable.

```cpp
class Solution {
public:
    bool canJump(vector<int>& nums) {
        int farthest = 0;
        for (int i = 0; i < nums.size(); i++) {
            if (i > farthest) return false; // can't even reach index i
            farthest = max(farthest, i + nums[i]);
        }
        return true;
    }
};
```
**Time:** O(n). **Space:** O(1).

---

### Jump Game II
**LeetCode:** https://leetcode.com/problems/jump-game-ii/

Same setup as Jump Game, but now find the **minimum number of jumps** to reach the last index (guaranteed reachable).

**Approach:** BFS-flavored greedy — treat it as expanding "levels". `currEnd` marks the boundary of the current jump; when the scan reaches it, a jump is forced and the boundary extends to the farthest seen so far.

```cpp
class Solution {
public:
    int jump(vector<int>& nums) {
        int jumps = 0, currEnd = 0, farthest = 0;
        for (int i = 0; i < nums.size() - 1; i++) {
            farthest = max(farthest, i + nums[i]);
            if (i == currEnd) {
                // Must jump now to keep progressing
                jumps++;
                currEnd = farthest;
            }
        }
        return jumps;
    }
};
```
**Time:** O(n). **Space:** O(1).

---

### Gas Station
**LeetCode:** https://leetcode.com/problems/gas-station/

Circular route of gas stations with `gas[i]` fuel available and `cost[i]` fuel needed to reach the next station. Find the starting station index that allows completing the full circuit, or return -1 if impossible.

**Approach:** A solution exists iff total gas ≥ total cost. Track a running tank; whenever it goes negative, no station between the last reset point and here can be a valid start, so reset the candidate start to the next station.

```cpp
class Solution {
public:
    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
        int totalTank = 0, currTank = 0, start = 0;
        for (int i = 0; i < gas.size(); i++) {
            int diff = gas[i] - cost[i];
            totalTank += diff;
            currTank += diff;
            if (currTank < 0) {
                // Can't reach station i+1 from current 'start' -> try starting after i
                start = i + 1;
                currTank = 0;
            }
        }
        return totalTank >= 0 ? start : -1;
    }
};
```
**Time:** O(n). **Space:** O(1).

---

## 4. Sorting + Two-Pointer Pairing

**Core idea:** Sort one or two arrays, then greedily pair elements from the ends (or match smallest-to-smallest) to satisfy a constraint optimally.

### Assign Cookies
**LeetCode:** https://leetcode.com/problems/assign-cookies/

Each child has a greed factor `g[i]`; each cookie has a size `s[j]`. A child is content if given a cookie of size ≥ their greed factor. Maximize the number of content children.

**Approach:** Sort both arrays. Use two pointers — give the smallest sufficient cookie to the least greedy unsatisfied child.

```cpp
class Solution {
public:
    int findContentChildren(vector<int>& g, vector<int>& s) {
        sort(g.begin(), g.end());
        sort(s.begin(), s.end());
        int child = 0, cookie = 0;
        while (child < g.size() && cookie < s.size()) {
            if (s[cookie] >= g[child]) {
                child++; // this cookie satisfies the current child
            }
            cookie++; // move to next cookie regardless
        }
        return child;
    }
};
```
**Time:** O(n log n + m log m). **Space:** O(1).

---

### Boats to Save People
**LeetCode:** https://leetcode.com/problems/boats-to-save-people/

Each boat holds at most 2 people with combined weight ≤ `limit`. Minimize the number of boats needed.

**Approach:** Sort weights. Use two pointers from lightest and heaviest — pair them if they fit together; otherwise the heaviest goes alone. Either way, one boat is used per outer loop iteration.

```cpp
class Solution {
public:
    int numRescueBoats(vector<int>& people, int limit) {
        sort(people.begin(), people.end());
        int lo = 0, hi = people.size() - 1;
        int boats = 0;
        while (lo <= hi) {
            if (people[lo] + people[hi] <= limit) {
                lo++; // lightest person can share the boat with the heaviest
            }
            hi--; // heaviest person always leaves on this boat
            boats++;
        }
        return boats;
    }
};
```
**Time:** O(n log n). **Space:** O(1).

---

### Two City Scheduling
**LeetCode:** https://leetcode.com/problems/two-city-scheduling/

`2n` people need interviews; `costs[i] = [costToA, costToB]`. Exactly `n` must go to city A and `n` to city B. Minimize total cost.

**Approach:** Sort by `(costA - costB)` ascending. The people for whom A is *relatively* cheapest go to A first (first `n` after sorting); the rest go to B. This is a classic exchange-argument greedy.

```cpp
class Solution {
public:
    int twoCitySchedCost(vector<vector<int>>& costs) {
        // Sort by how much cheaper city A is relative to city B
        sort(costs.begin(), costs.end(), [](const vector<int>& a, const vector<int>& b) {
            return (a[0] - a[1]) < (b[0] - b[1]);
        });
        int n = costs.size() / 2;
        int total = 0;
        for (int i = 0; i < costs.size(); i++) {
            total += (i < n) ? costs[i][0] : costs[i][1];
        }
        return total;
    }
};
```
**Time:** O(n log n). **Space:** O(1).

---

## 5. Monotonic Stack Greedy

**Core idea:** Build the answer character-by-character using a stack; pop from the stack when the top violates optimality **and** it's safe to do so (i.e., that character reappears later, or removal budget remains).

### Remove Duplicate Letters
**LeetCode:** https://leetcode.com/problems/remove-duplicate-letters/
*(Identical to LeetCode 1081 "Smallest Subsequence of Distinct Characters")*

Given a string, remove duplicate letters so every letter appears exactly once, the result is the smallest possible in lexicographic order, and relative order of remaining letters is preserved.

**Approach:** Track the last occurrence index of each letter and whether it's currently in the stack. While the top of the stack is greater than the current character **and** will occur again later, pop it — it's safe to place it later and doing so yields a smaller result now.

```cpp
class Solution {
public:
    string removeDuplicateLetters(string s) {
        vector<int> lastIndex(26, 0);
        for (int i = 0; i < s.size(); i++) lastIndex[s[i] - 'a'] = i;

        vector<bool> inStack(26, false);
        string stk; // used as a stack via push_back/pop_back
        for (int i = 0; i < s.size(); i++) {
            char c = s[i];
            if (inStack[c - 'a']) continue; // already placed, skip

            // Pop chars that are greater than c AND reappear later (safe to remove now)
            while (!stk.empty() && stk.back() > c && lastIndex[stk.back() - 'a'] > i) {
                inStack[stk.back() - 'a'] = false;
                stk.pop_back();
            }
            stk.push_back(c);
            inStack[c - 'a'] = true;
        }
        return stk;
    }
};
```
**Time:** O(n). **Space:** O(1) — bounded by 26 letters (excluding the output string).

---

### Remove K Digits
**LeetCode:** https://leetcode.com/problems/remove-k-digits/

Given a non-negative integer as a string, remove `k` digits to make the smallest possible number.

**Approach:** Maintain an increasing monotonic stack. Whenever the current digit is smaller than the stack's top and removals remain, pop — a larger leading digit hurts more than a later one. If removals remain after the scan, trim from the end.

```cpp
class Solution {
public:
    string removeKdigits(string num, int k) {
        string stk;
        for (char c : num) {
            // Pop while top is greater than current digit and removals are left
            while (!stk.empty() && k > 0 && stk.back() > c) {
                stk.pop_back();
                k--;
            }
            stk.push_back(c);
        }
        // If removals remain, remove from the end (largest digits end up there)
        while (k > 0) {
            stk.pop_back();
            k--;
        }
        // Strip leading zeros
        int start = 0;
        while (start < (int)stk.size() - 1 && stk[start] == '0') start++;
        stk = stk.substr(start);
        return stk.empty() ? "0" : stk;
    }
};
```
**Time:** O(n) — each digit is pushed and popped at most once. **Space:** O(n) for the stack.

---

## 6. Local Exchange-Argument Greedy

**Core idea:** Satisfy each local constraint independently (often via one or two linear passes), and prove that combining these local optima yields the global optimum.

### Candy
**LeetCode:** https://leetcode.com/problems/candy/

Children stand in a line with ratings. Each child gets ≥1 candy; a child with a higher rating than a neighbor must get more candy than that neighbor. Minimize the total candies.

**Approach:** Two passes. Left-to-right enforces the "greater than left neighbor" rule; right-to-left enforces the "greater than right neighbor" rule. Take the max of both requirements at each index.

```cpp
class Solution {
public:
    int candy(vector<int>& ratings) {
        int n = ratings.size();
        vector<int> candies(n, 1);

        // Left to right: satisfy the left-neighbor constraint
        for (int i = 1; i < n; i++) {
            if (ratings[i] > ratings[i - 1]) {
                candies[i] = candies[i - 1] + 1;
            }
        }
        // Right to left: satisfy the right-neighbor constraint
        for (int i = n - 2; i >= 0; i--) {
            if (ratings[i] > ratings[i + 1]) {
                candies[i] = max(candies[i], candies[i + 1] + 1);
            }
        }

        int total = 0;
        for (int c : candies) total += c;
        return total;
    }
};
```
**Time:** O(n). **Space:** O(n) for the candies array.

---

### Partition Labels
**LeetCode:** https://leetcode.com/problems/partition-labels/

Partition a string into as many parts as possible so that each letter appears in at most one part.

**Approach:** Precompute the last occurrence index of every letter. Scan left to right, extending the current partition's boundary to the farthest "last index" among letters seen so far; close the partition once the scan reaches that boundary.

```cpp
class Solution {
public:
    vector<int> partitionLabels(string s) {
        vector<int> lastIndex(26, 0);
        for (int i = 0; i < s.size(); i++) lastIndex[s[i] - 'a'] = i;

        vector<int> result;
        int start = 0, end = 0;
        for (int i = 0; i < s.size(); i++) {
            end = max(end, lastIndex[s[i] - 'a']); // extend partition boundary
            if (i == end) {
                // Every letter seen in this partition is fully contained -> close it
                result.push_back(end - start + 1);
                start = i + 1;
            }
        }
        return result;
    }
};
```
**Time:** O(n). **Space:** O(1) extra (26 letters, output not counted).

---

### Task Scheduler
**LeetCode:** https://leetcode.com/problems/task-scheduler/

Given tasks and a cooldown `n` between two occurrences of the same task, find the minimum total time (including idle slots) to finish all tasks.

**Approach:** The most frequent task dictates the schedule's skeleton — space its occurrences `n+1` apart, filling gaps with other tasks. If ties exist for max frequency, each contributes one extra slot in the final row. The answer is the larger of this theoretical minimum and simply `tasks.size()` (no idle time needed if tasks are plentiful and varied).

```cpp
class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        vector<int> freq(26, 0);
        for (char t : tasks) freq[t - 'A']++;

        int maxFreq = *max_element(freq.begin(), freq.end());
        int maxCount = 0; // how many tasks share the max frequency
        for (int f : freq) {
            if (f == maxFreq) maxCount++;
        }

        // Idle-slot skeleton: (maxFreq - 1) full cycles of length (n + 1),
        // plus one slot per task that ties for the max frequency in the final row
        int slots = (maxFreq - 1) * (n + 1) + maxCount;
        return max((int)tasks.size(), slots);
    }
};
```
**Time:** O(n) where n = tasks.size() (26-letter counting is O(1)). **Space:** O(1).

---

## 7. Heap-Based Greedy

**Core idea:** When "pick the best currently-available option" changes as the pool of eligible options grows, a priority queue keeps the current best accessible in O(log n).

### IPO
**LeetCode:** https://leetcode.com/problems/ipo/

Choose at most `k` distinct projects to maximize final capital. Each project has a required `capital[i]` and yields `profits[i]`; you can only start a project if you currently have enough capital.

**Approach:** Sort projects by required capital. Maintain a max-heap of profits for all projects currently affordable. At each of the `k` steps, push newly affordable projects, then greedily take the most profitable one available.

```cpp
class Solution {
public:
    int findMaximizedCapital(int k, int w, vector<int>& profits, vector<int>& capital) {
        int n = profits.size();
        vector<pair<int,int>> projects(n); // {capital required, profit}
        for (int i = 0; i < n; i++) projects[i] = {capital[i], profits[i]};
        sort(projects.begin(), projects.end());

        priority_queue<int> maxHeap; // max-heap of profits currently affordable
        int idx = 0;
        for (int i = 0; i < k; i++) {
            // Push all projects that are now affordable with capital w
            while (idx < n && projects[idx].first <= w) {
                maxHeap.push(projects[idx].second);
                idx++;
            }
            if (maxHeap.empty()) break; // no affordable project remains
            w += maxHeap.top(); // greedily take the most profitable affordable project
            maxHeap.pop();
        }
        return w;
    }
};
```
**Time:** O(n log n) for sorting + O(n log n) for heap operations. **Space:** O(n).

---

### Reorganize String
**LeetCode:** https://leetcode.com/problems/reorganize-string/

Rearrange a string so that no two adjacent characters are the same. Return `""` if impossible.

**Approach:** If the most frequent character occurs more than `(n+1)/2` times, it's impossible. Otherwise, use a max-heap keyed by frequency; repeatedly pop the two most frequent distinct characters and place them adjacently, pushing them back with decremented counts if any remain.

```cpp
class Solution {
public:
    string reorganizeString(string s) {
        vector<int> freq(26, 0);
        for (char c : s) freq[c - 'a']++;

        int maxFreq = *max_element(freq.begin(), freq.end());
        if (maxFreq > (int)(s.size() + 1) / 2) return ""; // impossible to arrange

        // Max-heap of {frequency, character}
        priority_queue<pair<int,char>> maxHeap;
        for (int i = 0; i < 26; i++) {
            if (freq[i] > 0) maxHeap.push({freq[i], (char)('a' + i)});
        }

        string result;
        while (maxHeap.size() >= 2) {
            auto [f1, c1] = maxHeap.top(); maxHeap.pop();
            auto [f2, c2] = maxHeap.top(); maxHeap.pop();
            // Place the two most frequent remaining characters back-to-back
            result += c1;
            result += c2;
            if (--f1 > 0) maxHeap.push({f1, c1});
            if (--f2 > 0) maxHeap.push({f2, c2});
        }
        if (!maxHeap.empty()) {
            auto [f, c] = maxHeap.top();
            if (f > 1) return ""; // safety net; shouldn't trigger given the earlier check
            result += c;
        }
        return result;
    }
};
```
**Time:** O(n log 26) ≈ O(n). **Space:** O(1) extra for the heap (26 letters) + O(n) for the output.

---

## Quick Reference Table

| # | Problem | Group | Time | Space |
|---|---------|-------|------|-------|
| 1 | Non-overlapping Intervals | Interval Scheduling | O(n log n) | O(1) |
| 2 | Min Arrows to Burst Balloons | Interval Scheduling | O(n log n) | O(1) |
| 3 | N Meetings in One Room | Interval Scheduling | O(n log n) | O(n) |
| 4 | Merge Intervals | Interval Merging | O(n log n) | O(n) |
| 5 | Insert Interval | Interval Merging | O(n) | O(n) |
| 6 | Jump Game | Reachability Scan | O(n) | O(1) |
| 7 | Jump Game II | Reachability Scan | O(n) | O(1) |
| 8 | Gas Station | Reachability Scan | O(n) | O(1) |
| 9 | Assign Cookies | Sort + Two-Pointer | O(n log n) | O(1) |
| 10 | Boats to Save People | Sort + Two-Pointer | O(n log n) | O(1) |
| 11 | Two City Scheduling | Sort + Two-Pointer | O(n log n) | O(1) |
| 12 | Remove Duplicate Letters | Monotonic Stack | O(n) | O(1) |
| 13 | Remove K Digits | Monotonic Stack | O(n) | O(n) |
| 14 | Candy | Exchange Argument | O(n) | O(n) |
| 15 | Partition Labels | Exchange Argument | O(n) | O(1) |
| 16 | Task Scheduler | Exchange Argument | O(n) | O(1) |
| 17 | IPO | Heap-Based | O(n log n) | O(n) |
| 18 | Reorganize String | Heap-Based | O(n log n) | O(n) |
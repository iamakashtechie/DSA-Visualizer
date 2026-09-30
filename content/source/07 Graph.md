# Graph Problems — LeetCode Cheatsheet (C++)

Problems grouped by underlying technique, not difficulty. Each entry has intuition before code so you can rebuild the decision tree yourself instead of memorizing.

---

## A. Grid Traversal (DFS/BFS Flood Fill & Connected Components)

Grids are graphs in disguise — each cell is a node, 4 (or 8) neighbors are edges. This group is about marking visited cells so you don't revisit, exactly like the `push_back`/`pop_back` bookkeeping you're used to from backtracking, except here "visited" state usually doesn't need to be undone.

### 1. Number of Islands
[LeetCode 200](https://leetcode.com/problems/number-of-islands/)

Given a grid of `'1'` (land) and `'0'` (water), count the number of islands (land connected 4-directionally).

**Approach:** For every unvisited `'1'`, run a DFS that sinks the whole island (turns visited cells to `'0'`) and count how many times you had to start a fresh DFS.

```cpp
class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        int rows = grid.size(), cols = grid[0].size();
        int islands = 0;

        function<void(int,int)> dfs = [&](int r, int c) {
            if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] != '1') return;
            grid[r][c] = '0'; // mark visited by sinking the land
            dfs(r + 1, c); dfs(r - 1, c);
            dfs(r, c + 1); dfs(r, c - 1);
        };

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == '1') {
                    islands++;
                    dfs(r, c); // sink entire island so it's never counted again
                }
            }
        }
        return islands;
    }
};
```

**Time:** O(rows × cols) — each cell visited once.
**Space:** O(rows × cols) worst case recursion stack (fully-land grid).

---

### 2. Max Area of Island
[LeetCode 695](https://leetcode.com/problems/max-area-of-island/)

Same grid setup as above, but return the area of the **largest** island instead of the count.

**Approach:** Identical DFS, but make it return the size of the island it just explored, and track the max across all starts.

```cpp
class Solution {
public:
    int maxAreaOfIsland(vector<vector<int>>& grid) {
        int rows = grid.size(), cols = grid[0].size();

        function<int(int,int)> dfs = [&](int r, int c) -> int {
            if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] != 1) return 0;
            grid[r][c] = 0; // sink
            return 1 + dfs(r+1, c) + dfs(r-1, c) + dfs(r, c+1) + dfs(r, c-1);
        };

        int best = 0;
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                if (grid[r][c] == 1)
                    best = max(best, dfs(r, c));
        return best;
    }
};
```

**Time:** O(rows × cols). **Space:** O(rows × cols) recursion stack worst case.

---

### 3. Flood Fill
[LeetCode 733](https://leetcode.com/problems/flood-fill/)

Given a starting pixel and a new color, repaint the whole connected region of the original color (like the paint bucket tool).

**Approach:** DFS from the start pixel, repainting as you go; guard against the no-op case where the new color equals the old color (would infinite-loop otherwise).

```cpp
class Solution {
public:
    vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {
        int oldColor = image[sr][sc];
        if (oldColor == color) return image; // avoid infinite recursion on no-op

        int rows = image.size(), cols = image[0].size();
        function<void(int,int)> dfs = [&](int r, int c) {
            if (r < 0 || r >= rows || c < 0 || c >= cols || image[r][c] != oldColor) return;
            image[r][c] = color;
            dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1);
        };
        dfs(sr, sc);
        return image;
    }
};
```

**Time:** O(rows × cols). **Space:** O(rows × cols) recursion stack worst case.

---

### 4. Surrounded Regions
[LeetCode 130](https://leetcode.com/problems/surrounded-regions/)

Capture all regions of `'O'` that are **fully surrounded** by `'X'` (flip them to `'X'`). Regions touching the border are safe and stay `'O'`.

**Approach:** Instead of checking "is this region surrounded" directly, flip the problem — any `'O'` reachable from the border can never be surrounded, so mark those safe first (DFS from every border cell), then flip everything else.

```cpp
class Solution {
public:
    void solve(vector<vector<char>>& board) {
        int rows = board.size(), cols = board[0].size();

        function<void(int,int)> dfs = [&](int r, int c) {
            if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] != 'O') return;
            board[r][c] = '#'; // temp mark = safe, border-connected
            dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1);
        };

        // Step 1: protect every 'O' reachable from the border
        for (int r = 0; r < rows; r++) { dfs(r, 0); dfs(r, cols - 1); }
        for (int c = 0; c < cols; c++) { dfs(0, c); dfs(rows - 1, c); }

        // Step 2: flip surrounded 'O' -> 'X', restore safe '#' -> 'O'
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (board[r][c] == 'O') board[r][c] = 'X';
                else if (board[r][c] == '#') board[r][c] = 'O';
            }
        }
    }
};
```

**Time:** O(rows × cols). **Space:** O(rows × cols) recursion stack worst case.

---

### 5. Pacific Atlantic Water Flow
[LeetCode 417](https://leetcode.com/problems/pacific-atlantic-water-flow/)

Water flows from a cell to a neighbor only if the neighbor's height is `<=` current height. Find all cells from which water can reach **both** the Pacific (top/left edges) and Atlantic (bottom/right edges).

**Approach:** Reverse the flow — run DFS outward from the Pacific border and separately from the Atlantic border, moving to a neighbor only if its height is `>=` current (uphill, since we're reversing). Intersect the two reachable sets.

```cpp
class Solution {
public:
    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
        int rows = heights.size(), cols = heights[0].size();
        vector<vector<bool>> pacific(rows, vector<bool>(cols, false));
        vector<vector<bool>> atlantic(rows, vector<bool>(cols, false));

        function<void(int,int,vector<vector<bool>>&)> dfs = [&](int r, int c, vector<vector<bool>>& visited) {
            visited[r][c] = true;
            int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
            for (int i = 0; i < 4; i++) {
                int nr = r + dr[i], nc = c + dc[i];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                if (visited[nr][nc] || heights[nr][nc] < heights[r][c]) continue; // must flow uphill (reversed)
                dfs(nr, nc, visited);
            }
        };

        for (int r = 0; r < rows; r++) { dfs(r, 0, pacific); dfs(r, cols - 1, atlantic); }
        for (int c = 0; c < cols; c++) { dfs(0, c, pacific); dfs(rows - 1, c, atlantic); }

        vector<vector<int>> result;
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                if (pacific[r][c] && atlantic[r][c])
                    result.push_back({r, c});
        return result;
    }
};
```

**Time:** O(rows × cols). **Space:** O(rows × cols) for visited arrays + recursion stack.

---

## B. Union-Find / Disjoint Set (Connected Components)

When the question is "are these nodes in the same group" or "how many groups exist," Union-Find is usually faster to write correctly than DFS/BFS, especially when edges come in as a list rather than an adjacency structure.

### 6. Number of Provinces
[LeetCode 547](https://leetcode.com/problems/number-of-provinces/)

Given an `n x n` adjacency matrix `isConnected` where `isConnected[i][j] = 1` means city `i` and `j` are directly connected, find the number of provinces (connected components).

**Approach:** Union every direct connection, then count how many distinct roots remain.

```cpp
class DSU {
    vector<int> parent, rank_;
public:
    DSU(int n) : parent(n), rank_(n, 0) {
        iota(parent.begin(), parent.end(), 0); // each node is its own parent initially
    }
    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]); // path compression
        return parent[x];
    }
    void unite(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return;
        if (rank_[ra] < rank_[rb]) swap(ra, rb);
        parent[rb] = ra;
        if (rank_[ra] == rank_[rb]) rank_[ra]++;
    }
};

class Solution {
public:
    int findCircleNum(vector<vector<int>>& isConnected) {
        int n = isConnected.size();
        DSU dsu(n);
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                if (isConnected[i][j] == 1)
                    dsu.unite(i, j);

        unordered_set<int> roots;
        for (int i = 0; i < n; i++) roots.insert(dsu.find(i));
        return roots.size();
    }
};
```

**Time:** O(n² · α(n)) — near-constant find/union with path compression + rank.
**Space:** O(n) for the DSU arrays.

---

### 7. Redundant Connection
[LeetCode 684](https://leetcode.com/problems/redundant-connection/)

A tree with `n` nodes had one extra edge added, creating exactly one cycle. Find the edge that can be removed to restore a tree (if multiple answers, return the last one in the input).

**Approach:** Process edges in order, union each pair. The first edge whose two endpoints are **already** in the same set is the redundant one — adding it is what creates the cycle.

```cpp
class Solution {
public:
    vector<int> findRedundantConnection(vector<vector<int>>& edges) {
        int n = edges.size();
        vector<int> parent(n + 1);
        iota(parent.begin(), parent.end(), 0);

        function<int(int)> find = [&](int x) {
            while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } // path halving
            return x;
        };

        for (auto& e : edges) {
            int ra = find(e[0]), rb = find(e[1]);
            if (ra == rb) return e; // this edge closes a cycle -> it's the answer
            parent[ra] = rb;
        }
        return {}; // unreachable given problem constraints
    }
};
```

**Time:** O(n · α(n)). **Space:** O(n).

---

### 8. Number of Connected Components in an Undirected Graph
LeetCode 323 is premium — [GFG version](https://www.geeksforgeeks.org/number-of-connected-components-in-a-undirected-graph/)

Given `n` nodes labeled `0` to `n-1` and a list of undirected edges, count the number of connected components.

**Approach:** Same DSU pattern — union every edge, count distinct roots at the end.

```cpp
class Solution {
public:
    int countComponents(int n, vector<vector<int>>& edges) {
        vector<int> parent(n);
        iota(parent.begin(), parent.end(), 0);
        int components = n; // start assuming every node is isolated

        function<int(int)> find = [&](int x) {
            while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
            return x;
        };

        for (auto& e : edges) {
            int ra = find(e[0]), rb = find(e[1]);
            if (ra != rb) {
                parent[ra] = rb;
                components--; // merging two groups reduces total component count
            }
        }
        return components;
    }
};
```

**Time:** O((n + E) · α(n)). **Space:** O(n).

---

## C. Topological Sort (DAG Ordering & Cycle Detection)

Used whenever a problem says "must be done before," "depends on," or "prerequisite." The graph is directed; the question is really "does a valid linear order exist" (no cycle) and/or "what is that order."

### 9. Course Schedule
[LeetCode 207](https://leetcode.com/problems/course-schedule/)

Given `numCourses` and a list of prerequisite pairs `[a, b]` (must take `b` before `a`), determine if it's possible to finish all courses (i.e., no cycle in the prerequisite graph).

**Approach:** Kahn's algorithm — BFS from all nodes with indegree 0, decrementing neighbors' indegree as you "complete" a course. If every node gets processed, there's no cycle.

```cpp
class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> adj(numCourses);
        vector<int> indegree(numCourses, 0);

        for (auto& p : prerequisites) {
            adj[p[1]].push_back(p[0]); // edge: prereq -> dependent course
            indegree[p[0]]++;
        }

        queue<int> q;
        for (int i = 0; i < numCourses; i++)
            if (indegree[i] == 0) q.push(i); // courses with no prerequisite can start immediately

        int processed = 0;
        while (!q.empty()) {
            int cur = q.front(); q.pop();
            processed++;
            for (int next : adj[cur])
                if (--indegree[next] == 0) q.push(next);
        }
        return processed == numCourses; // if not all processed, a cycle blocked some courses
    }
};
```

**Time:** O(V + E). **Space:** O(V + E) for adjacency list + queue.

---

### 10. Course Schedule II
[LeetCode 210](https://leetcode.com/problems/course-schedule-ii/)

Same setup as above, but return a valid course order instead of just yes/no. Return an empty array if impossible.

**Approach:** Identical Kahn's BFS, but record the order nodes are popped in.

```cpp
class Solution {
public:
    vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> adj(numCourses);
        vector<int> indegree(numCourses, 0);

        for (auto& p : prerequisites) {
            adj[p[1]].push_back(p[0]);
            indegree[p[0]]++;
        }

        queue<int> q;
        for (int i = 0; i < numCourses; i++)
            if (indegree[i] == 0) q.push(i);

        vector<int> order;
        while (!q.empty()) {
            int cur = q.front(); q.pop();
            order.push_back(cur);
            for (int next : adj[cur])
                if (--indegree[next] == 0) q.push(next);
        }
        return order.size() == numCourses ? order : vector<int>{};
    }
};
```

**Time:** O(V + E). **Space:** O(V + E).

---

### 11. Alien Dictionary
LeetCode 269 is premium — [GFG version](https://www.geeksforgeeks.org/alien-dictionary/)

Given a list of words sorted according to an unknown alien alphabet, determine the order of the letters.

**Approach:** Compare each pair of adjacent words to find the first differing character — that gives you one directed edge `firstChar -> secondChar` in the alphabet graph. Then topological sort the 26 letters.

```cpp
class Solution {
public:
    string findOrder(vector<string>& words) {
        unordered_map<char, unordered_set<char>> adj;
        unordered_map<char, int> indegree;
        for (auto& w : words)
            for (char c : w) indegree[c] = 0; // ensure every seen letter is a node

        for (int i = 0; i + 1 < words.size(); i++) {
            string &w1 = words[i], &w2 = words[i + 1];
            int minLen = min(w1.size(), w2.size());
            bool foundDiff = false;
            for (int j = 0; j < minLen; j++) {
                if (w1[j] != w2[j]) {
                    if (!adj[w1[j]].count(w2[j])) {
                        adj[w1[j]].insert(w2[j]);
                        indegree[w2[j]]++;
                    }
                    foundDiff = true;
                    break;
                }
            }
            // invalid case: "abc" before "ab" -> prefix must come first
            if (!foundDiff && w1.size() > w2.size()) return "";
        }

        queue<char> q;
        for (auto& [ch, deg] : indegree) if (deg == 0) q.push(ch);

        string order;
        while (!q.empty()) {
            char cur = q.front(); q.pop();
            order += cur;
            for (char next : adj[cur])
                if (--indegree[next] == 0) q.push(next);
        }
        return order.size() == indegree.size() ? order : ""; // cycle -> invalid ordering
    }
};
```

**Time:** O(total characters across all words). **Space:** O(1) — bounded by 26 letters.

---

## D. BFS Shortest Path (Unweighted Graphs)

BFS explores level by level, so the first time you reach a node is guaranteed to be via the shortest path — but only when every edge has equal weight (weight 1). This group is all "minimum steps/time" questions on unweighted graphs.

### 12. Rotting Oranges
[LeetCode 994](https://leetcode.com/problems/rotting-oranges/)

A grid has fresh oranges (1), rotten oranges (2), and empty cells (0). Every minute, a rotten orange rots its fresh neighbors. Return the minutes until no fresh orange remains, or -1 if impossible.

**Approach:** Multi-source BFS — push **all** initially rotten oranges into the queue at once, then expand level by level; each level = one minute.

```cpp
class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int rows = grid.size(), cols = grid[0].size();
        queue<pair<int,int>> q;
        int freshCount = 0;

        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == 2) q.push({r, c}); // all rotten oranges start together
                else if (grid[r][c] == 1) freshCount++;
            }

        if (freshCount == 0) return 0;

        int minutes = 0;
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        while (!q.empty()) {
            int levelSize = q.size();
            bool rottedAny = false;
            for (int i = 0; i < levelSize; i++) {
                auto [r, c] = q.front(); q.pop();
                for (int d = 0; d < 4; d++) {
                    int nr = r + dr[d], nc = c + dc[d];
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] != 1) continue;
                    grid[nr][nc] = 2;
                    freshCount--;
                    rottedAny = true;
                    q.push({nr, nc});
                }
            }
            if (rottedAny) minutes++;
        }
        return freshCount == 0 ? minutes : -1;
    }
};
```

**Time:** O(rows × cols). **Space:** O(rows × cols) for the queue.

---

### 13. 01 Matrix
[LeetCode 542](https://leetcode.com/problems/01-matrix/)

Given a binary matrix, return the distance to the nearest 0 for every cell.

**Approach:** Multi-source BFS starting from all 0-cells simultaneously — every cell's first-visit distance is its shortest distance to any 0.

```cpp
class Solution {
public:
    vector<vector<int>> updateMatrix(vector<vector<int>>& mat) {
        int rows = mat.size(), cols = mat[0].size();
        vector<vector<int>> dist(rows, vector<int>(cols, -1));
        queue<pair<int,int>> q;

        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                if (mat[r][c] == 0) { dist[r][c] = 0; q.push({r, c}); }

        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        while (!q.empty()) {
            auto [r, c] = q.front(); q.pop();
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || dist[nr][nc] != -1) continue;
                dist[nr][nc] = dist[r][c] + 1;
                q.push({nr, nc});
            }
        }
        return dist;
    }
};
```

**Time:** O(rows × cols). **Space:** O(rows × cols).

---

### 14. Word Ladder
[LeetCode 127](https://leetcode.com/problems/word-ladder/)

Given `beginWord`, `endWord`, and a word list, find the length of the shortest transformation sequence changing one letter at a time, where each intermediate word must exist in the list.

**Approach:** Treat each word as a node; an edge exists between two words that differ by exactly one letter. BFS from `beginWord` — first time you reach `endWord` gives the shortest path length.

```cpp
class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> dict(wordList.begin(), wordList.end());
        if (!dict.count(endWord)) return 0;

        queue<string> q;
        q.push(beginWord);
        int steps = 1;

        while (!q.empty()) {
            int levelSize = q.size();
            for (int i = 0; i < levelSize; i++) {
                string word = q.front(); q.pop();
                if (word == endWord) return steps;

                for (int pos = 0; pos < word.size(); pos++) {
                    char original = word[pos];
                    for (char c = 'a'; c <= 'z'; c++) {
                        if (c == original) continue;
                        word[pos] = c;
                        if (dict.count(word)) {
                            dict.erase(word); // remove so it's never re-queued (acts as visited)
                            q.push(word);
                        }
                    }
                    word[pos] = original; // restore before trying next position
                }
            }
            steps++;
        }
        return 0;
    }
};
```

**Time:** O(N × L² × 26) where N = word list size, L = word length.
**Space:** O(N × L) for the dictionary and queue.

---

## E. Dijkstra's Algorithm (Weighted Shortest Path, Non-negative Weights)

Once edges have different weights, plain BFS breaks (the first-reached node isn't necessarily the cheapest). Dijkstra fixes this with a min-heap that always expands the currently-cheapest frontier node next.

### 15. Network Delay Time
[LeetCode 743](https://leetcode.com/problems/network-delay-time/)

Signal sent from node `k` travels through weighted directed edges `times[i] = [u, v, w]`. Return the time for **all** nodes to receive the signal, or -1 if impossible.

**Approach:** Standard Dijkstra from source `k`; the answer is the max distance among all reachable nodes (last node to receive the signal).

```cpp
class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        vector<vector<pair<int,int>>> adj(n + 1); // adj[u] = {v, weight}
        for (auto& t : times) adj[t[0]].push_back({t[1], t[2]});

        vector<int> dist(n + 1, INT_MAX);
        dist[k] = 0;
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq; // min-heap by distance
        pq.push({0, k});

        while (!pq.empty()) {
            auto [d, u] = pq.top(); pq.pop();
            if (d > dist[u]) continue; // stale entry, a shorter path was already found
            for (auto& [v, w] : adj[u]) {
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    pq.push({dist[v], v});
                }
            }
        }

        int maxDist = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[i] == INT_MAX) return -1; // unreachable node
            maxDist = max(maxDist, dist[i]);
        }
        return maxDist;
    }
};
```

**Time:** O(E log V). **Space:** O(V + E).

---

### 16. Path With Minimum Effort
[LeetCode 1631](https://leetcode.com/problems/path-with-minimum-effort/)

Grid of heights; moving between adjacent cells costs the absolute height difference. Find a path from top-left to bottom-right minimizing the **maximum** single-step effort along the path.

**Approach:** Dijkstra variant — instead of summing weights, "distance" to a node is the max edge weight seen so far on the best path to it. Relax using `max(currentEffort, edgeWeight)` instead of addition.

```cpp
class Solution {
public:
    int minimumEffortPath(vector<vector<int>>& heights) {
        int rows = heights.size(), cols = heights[0].size();
        vector<vector<int>> effort(rows, vector<int>(cols, INT_MAX));
        effort[0][0] = 0;

        priority_queue<tuple<int,int,int>, vector<tuple<int,int,int>>, greater<>> pq; // {effort, r, c}
        pq.push({0, 0, 0});
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};

        while (!pq.empty()) {
            auto [e, r, c] = pq.top(); pq.pop();
            if (r == rows - 1 && c == cols - 1) return e; // reached destination
            if (e > effort[r][c]) continue;

            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                int newEffort = max(e, abs(heights[nr][nc] - heights[r][c])); // bottleneck, not sum
                if (newEffort < effort[nr][nc]) {
                    effort[nr][nc] = newEffort;
                    pq.push({newEffort, nr, nc});
                }
            }
        }
        return 0;
    }
};
```

**Time:** O(rows × cols × log(rows × cols)). **Space:** O(rows × cols).

---

## F. Bellman-Ford (Shortest Path with Constraints / Negative Weights)

Dijkstra can't handle negative weights, and it also can't naturally express "at most K edges." Bellman-Ford relaxes all edges repeatedly (K+1 times for a K-stop constraint) and handles both.

### 17. Cheapest Flights Within K Stops
[LeetCode 787](https://leetcode.com/problems/cheapest-flights-within-k-stops/)

Directed weighted flight graph. Find the cheapest price from `src` to `dst` using **at most `k` stops** (i.e., at most `k+1` edges).

**Approach:** Bellman-Ford limited to `k+1` relaxation rounds. Use a snapshot of distances from the previous round so you don't use more than one edge's worth of updates per round.

```cpp
class Solution {
public:
    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
        vector<int> dist(n, INT_MAX);
        dist[src] = 0;

        for (int round = 0; round <= k; round++) { // k stops = k+1 edges max
            vector<int> next = dist; // snapshot so updates don't chain within the same round
            for (auto& f : flights) {
                int u = f[0], v = f[1], w = f[2];
                if (dist[u] != INT_MAX && dist[u] + w < next[v])
                    next[v] = dist[u] + w;
            }
            dist = next;
        }
        return dist[dst] == INT_MAX ? -1 : dist[dst];
    }
};
```

**Time:** O(k × E). **Space:** O(n).

---

## G. Minimum Spanning Tree (Prim's)

MST questions want the cheapest set of edges that connects all nodes with no cycles. Prim's grows one tree outward, always adding the cheapest edge to a not-yet-included node — same min-heap pattern as Dijkstra, but the heap key is edge weight, not path distance.

### 18. Min Cost to Connect All Points
[LeetCode 1584](https://leetcode.com/problems/min-cost-to-connect-all-points/)

Given points on a 2D plane, connect all of them with the minimum total Manhattan-distance cost (edges implicitly exist between every pair).

**Approach:** Prim's MST — start from any point, repeatedly pull the cheapest edge to an unvisited point from a min-heap, add its cost, mark visited, push its new edges.

```cpp
class Solution {
public:
    int minCostConnectPoints(vector<vector<int>>& points) {
        int n = points.size();
        vector<bool> visited(n, false);
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq; // {cost, point index}
        pq.push({0, 0});

        int totalCost = 0, edgesUsed = 0;
        while (edgesUsed < n) {
            auto [cost, u] = pq.top(); pq.pop();
            if (visited[u]) continue; // stale entry
            visited[u] = true;
            totalCost += cost;
            edgesUsed++;

            for (int v = 0; v < n; v++) {
                if (!visited[v]) {
                    int dist = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1]);
                    pq.push({dist, v});
                }
            }
        }
        return totalCost;
    }
};
```

**Time:** O(n² log n). **Space:** O(n²) worst case for the heap.

---

## H. Bipartite Graph Coloring

"Can this graph be split into two groups such that every edge crosses groups" — solved with 2-coloring via DFS/BFS. If you ever try to color a neighbor the same as the current node, it's not bipartite.

### 19. Is Graph Bipartite?
[LeetCode 785](https://leetcode.com/problems/is-graph-bipartite/)

Given an undirected graph as an adjacency list, determine whether it can be colored with 2 colors such that no edge connects two same-colored nodes.

**Approach:** DFS/BFS coloring — color the start node 0, every neighbor gets the opposite color. If a neighbor is already colored the same as the current node, the graph isn't bipartite. Run from every uncolored node to handle disconnected components.

```cpp
class Solution {
public:
    bool isBipartite(vector<vector<int>>& graph) {
        int n = graph.size();
        vector<int> color(n, -1); // -1 = uncolored

        function<bool(int,int)> dfs = [&](int node, int c) -> bool {
            color[node] = c;
            for (int next : graph[node]) {
                if (color[next] == -1) {
                    if (!dfs(next, 1 - c)) return false; // flip color for neighbor
                } else if (color[next] == c) {
                    return false; // same color on both ends of an edge -> conflict
                }
            }
            return true;
        };

        for (int i = 0; i < n; i++)
            if (color[i] == -1 && !dfs(i, 0))
                return false;
        return true;
    }
};
```

**Time:** O(V + E). **Space:** O(V) for color array + recursion stack.

---

## I. Graph Construction / Cloning

### 20. Clone Graph
[LeetCode 133](https://leetcode.com/problems/clone-graph/)

Given a reference to a node in a connected undirected graph, return a deep copy (clone) of the graph.

**Approach:** DFS with a hashmap from original node → cloned node. Before recursing into a neighbor, check if it's already cloned to avoid infinite loops on cycles.

```cpp
class Node {
public:
    int val;
    vector<Node*> neighbors;
    Node(int _val) { val = _val; }
};

class Solution {
public:
    Node* cloneGraph(Node* node) {
        if (!node) return nullptr;
        unordered_map<Node*, Node*> cloned; // original -> clone

        function<Node*(Node*)> dfs = [&](Node* orig) -> Node* {
            if (cloned.count(orig)) return cloned[orig]; // already cloned, avoids infinite recursion on cycles

            Node* copy = new Node(orig->val);
            cloned[orig] = copy; // register BEFORE recursing into neighbors

            for (Node* neighbor : orig->neighbors)
                copy->neighbors.push_back(dfs(neighbor));

            return copy;
        };

        return dfs(node);
    }
};
```

**Time:** O(V + E). **Space:** O(V) for the hashmap + recursion stack.

---

## Quick Reference Table

| Sub-pattern | Signal in the problem | Technique |
|---|---|---|
| Grid flood fill | "count islands / regions", "connected cells" | DFS/BFS, mark visited |
| Union-Find | "same group?", edges given as a list, dynamic connectivity | DSU with path compression + rank |
| Topological sort | "prerequisite", "must come before", "order of tasks" | Kahn's BFS (indegree) or DFS post-order |
| BFS shortest path | "minimum steps/minutes", unweighted graph | Multi-source or single-source BFS |
| Dijkstra | Weighted edges, all non-negative, "shortest/cheapest path" | Min-heap relaxation |
| Bellman-Ford | Negative weights OR "at most K edges/stops" | K+1 relaxation rounds |
| MST (Prim's) | "connect all nodes at minimum total cost" | Min-heap growing one tree |
| Bipartite coloring | "split into two groups", "no edge within a group" | DFS/BFS 2-coloring |
| Clone/build | "deep copy of the graph" | DFS/BFS + hashmap of original→clone |
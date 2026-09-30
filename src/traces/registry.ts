import type { TraceModule } from './lib/types';
import { trace as twoSumII } from './two-pointer/two-sum-ii-input-array-is-sorted';
import { trace as containerWithMostWater } from './two-pointer/container-with-most-water';
import { trace as binarySearch } from './binary-search/binary-search';
import { trace as climbingStairs } from './dp/climbing-stairs';
import { trace as mergeIntervals } from './greedy/merge-intervals';
import { trace as numberOfIslands } from './graph/number-of-islands';
import { trace as subsets } from './backtracking/subsets';
import { trace as courseSchedule } from './graph/course-schedule';
import { trace as numberOf1Bits } from './bit-manipulation/number-of-1-bits';

import { trace as trappingRainWater } from './two-pointer/trapping-rain-water';
import { trace as sortColorsDutchNationalFlag3PointerVariant } from './two-pointer/sort-colors-dutch-national-flag-3-pointer-variant';
import { trace as maximumAverageSubarrayI } from './sliding-window/maximum-average-subarray-i';
import { trace as longestSubstringWithoutRepeatingCharacters } from './sliding-window/longest-substring-without-repeating-characters';
import { trace as minimumWindowSubstring } from './sliding-window/minimum-window-substring';
import { trace as slidingWindowMaximum } from './sliding-window/sliding-window-maximum';
import { trace as longestRepeatingCharacterReplacement } from './sliding-window/longest-repeating-character-replacement';
import { trace as searchInRotatedSortedArray } from './binary-search/search-in-rotated-sorted-array';
import { trace as kokoEatingBananas } from './binary-search/koko-eating-bananas';
import { trace as aggressiveCows } from './binary-search/aggressive-cows';
import { trace as searchA2dMatrix } from './binary-search/search-a-2d-matrix';
import { searchInsert, searchRange, singleElement, rotatedWithDuplicates, findMin, findPeak, peakIndex, shipCapacity, splitArray, bookAllocation, magneticForce, matrixSearchII, matrixMedian, kthSmallestMatrix, sqrtX } from './binary-search/missing';
import { combinationSum, combinationSumII, combinationSumIII, combinations, subsetsII, permutationsII, permutationsII as permutations, generateParentheses, nQueens, nQueensII, sudokuSolver, wordSearch, letterCombinations, palindromePartitioning, restoreIpAddresses } from './backtracking/missing';
import { minimumNumberOfArrows, meetingsInRoom, insertInterval, jumpGame, jumpGameII, gasStation, assignCookies, boatsToSavePeople, twoCityScheduling, removeDuplicateLetters, removeKDigits, candy, partitionLabels, taskScheduler, ipo, reorganizeString, nonOverlappingIntervals } from './greedy/missing';
import { trace as singleNumber } from './bit-manipulation/single-number';
import { trace as singleNumberIii } from './bit-manipulation/single-number-iii';
import { trace as subsetsBitmaskApproach } from './bit-manipulation/subsets-bitmask-approach';
import { trace as sumOfTwoIntegers } from './bit-manipulation/sum-of-two-integers';
import { countingBits, powerOfTwo, powerOfFour, singleNumberII, missingNumber, subsetsXor, divideIntegers, rangeAnd, numberComplement, reverseBits, maximumXor } from './bit-manipulation/missing';
import { numberOfProvinces, rottingOranges, networkDelayTime, maxAreaOfIsland, floodFill, surroundedRegions, pacificAtlantic, redundantConnection, numberOfComponents, courseScheduleII, alienDictionary, matrixBfs as matrix, wordLadder, pathMinimumEffort, cheapestFlights, minCostConnectPoints, isGraphBipartite, cloneGraph } from './graph/missing';
import { houseRobber, houseRobberII, decodeWays, uniquePaths, uniquePathsII, minimumPathSum, partitionEqualSubsetSum, targetSum, coinChange, coinChangeII, longestCommonSubsequence, editDistance, longestIncreasingSubsequence, longestPalindromicSubstring, palindromicSubstrings, longestPalindromicSubsequence, burstBalloons, stockCooldown, stockIII } from './dp/missing';
import { validPalindrome, threeSum, threeSumClosest, fourSum, squaresOfSortedArray, reverseString, removeDuplicates, moveZeroes, mergeSortedArray, intersectionOfTwoArrays, linkedListCycleFloyd, middleOfLinkedList, removeNthNode, palindromeLinkedList, minimumSizeSubarrayTwoPointer, longestSubstringTwoPointer } from './two-pointer/missing';
import { minimumSizeSubarray, permutationInString, findAllAnagrams, fruitIntoBaskets, maxConsecutiveOnes, subarrayProductLessThanK, maximumNumberOfVowels, longestSubarrayAfterDelete, frequencyOfMostFrequent } from './sliding-window/missing';

// Disable lint for explicit any, as we just want a map of all traces
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const traceRegistry: Record<string, TraceModule<any>> = {
  'two-pointer/two-sum-ii-input-array-is-sorted': twoSumII,
  'two-pointer/container-with-most-water': containerWithMostWater,
  'binary-search/binary-search': binarySearch,
  'dp/climbing-stairs': climbingStairs,
  'greedy/merge-intervals': mergeIntervals,
  'graph/number-of-islands': numberOfIslands,
  'backtracking/subsets': subsets,
  'graph/course-schedule': courseSchedule,
  'bit-manipulation/number-of-1-bits': numberOf1Bits,
  'two-pointer/trapping-rain-water': trappingRainWater,
  'two-pointer/sort-colors-dutch-national-flag-3-pointer-variant': sortColorsDutchNationalFlag3PointerVariant,
  'sliding-window/maximum-average-subarray-i': maximumAverageSubarrayI,
  'sliding-window/longest-substring-without-repeating-characters': longestSubstringWithoutRepeatingCharacters,
  'sliding-window/minimum-window-substring': minimumWindowSubstring,
  'sliding-window/sliding-window-maximum': slidingWindowMaximum,
  'sliding-window/longest-repeating-character-replacement': longestRepeatingCharacterReplacement,
  'binary-search/search-in-rotated-sorted-array': searchInRotatedSortedArray,
  'binary-search/koko-eating-bananas': kokoEatingBananas,
  'binary-search/aggressive-cows': aggressiveCows,
  'binary-search/search-a-2d-matrix': searchA2dMatrix,
  'binary-search/search-insert-position': searchInsert,
  'binary-search/find-first-and-last-position-of-element-in-sorted-array': searchRange,
  'binary-search/single-element-in-a-sorted-array': singleElement,
  'binary-search/search-in-rotated-sorted-array-ii': rotatedWithDuplicates,
  'binary-search/find-minimum-in-rotated-sorted-array': findMin,
  'binary-search/find-peak-element': findPeak,
  'binary-search/peak-index-in-a-mountain-array': peakIndex,
  'binary-search/capacity-to-ship-packages-within-d-days': shipCapacity,
  'binary-search/split-array-largest-sum': splitArray,
  'binary-search/book-allocation-problem': bookAllocation,
  'binary-search/magnetic-force-between-two-balls': magneticForce,
  'binary-search/search-a-2d-matrix-ii': matrixSearchII,
  'binary-search/median-of-two-sorted-arrays': matrixMedian,
  'binary-search/kth-smallest-element-in-a-sorted-matrix': kthSmallestMatrix,
  'binary-search/sqrtx': sqrtX,
  'backtracking/permutations': permutations,
  'backtracking/combination-sum': combinationSum,
  'backtracking/subsets-ii': subsetsII,
  'backtracking/combination-sum-ii': combinationSumII,
  'backtracking/combination-sum-iii': combinationSumIII,
  'backtracking/combinations': combinations,
  'backtracking/permutations-ii': permutationsII,
  'backtracking/palindrome-partitioning': palindromePartitioning,
  'backtracking/restore-ip-addresses': restoreIpAddresses,
  'backtracking/generate-parentheses': generateParentheses,
  'backtracking/n-queens': nQueens,
  'backtracking/n-queens-ii': nQueensII,
  'backtracking/sudoku-solver': sudokuSolver,
  'backtracking/letter-combinations-of-a-phone-number': letterCombinations,
  'backtracking/word-search': wordSearch,
  'greedy/non-overlapping-intervals': nonOverlappingIntervals,
  'greedy/minimum-number-of-arrows-to-burst-balloons': minimumNumberOfArrows,
  'greedy/n-meetings-in-one-room': meetingsInRoom,
  'greedy/jump-game': jumpGame,
  'greedy/insert-interval': insertInterval,
  'greedy/jump-game-ii': jumpGameII,
  'greedy/gas-station': gasStation,
  'greedy/assign-cookies': assignCookies,
  'greedy/boats-to-save-people': boatsToSavePeople,
  'greedy/two-city-scheduling': twoCityScheduling,
  'greedy/remove-duplicate-letters': removeDuplicateLetters,
  'greedy/remove-k-digits': removeKDigits,
  'greedy/candy': candy,
  'greedy/partition-labels': partitionLabels,
  'greedy/task-scheduler': taskScheduler,
  'greedy/ipo': ipo,
  'greedy/reorganize-string': reorganizeString,
  'bit-manipulation/single-number': singleNumber,
  'bit-manipulation/single-number-iii': singleNumberIii,
  'bit-manipulation/subsets-bitmask-approach': subsetsBitmaskApproach,
  'bit-manipulation/sum-of-two-integers': sumOfTwoIntegers,
  'bit-manipulation/counting-bits': countingBits,
  'bit-manipulation/power-of-two': powerOfTwo,
  'bit-manipulation/power-of-four': powerOfFour,
  'bit-manipulation/single-number-ii': singleNumberII,
  'bit-manipulation/missing-number': missingNumber,
  'bit-manipulation/sum-of-all-subset-xor-totals': subsetsXor,
  'bit-manipulation/divide-two-integers': divideIntegers,
  'bit-manipulation/bitwise-and-of-numbers-range': rangeAnd,
  'bit-manipulation/number-complement': numberComplement,
  'bit-manipulation/reverse-bits': reverseBits,
  'bit-manipulation/maximum-xor-of-two-numbers-in-an-array': maximumXor,
  'graph/number-of-provinces': numberOfProvinces,
  'graph/max-area-of-island': maxAreaOfIsland,
  'graph/flood-fill': floodFill,
  'graph/surrounded-regions': surroundedRegions,
  'graph/pacific-atlantic-water-flow': pacificAtlantic,
  'graph/redundant-connection': redundantConnection,
  'graph/number-of-connected-components-in-an-undirected-graph': numberOfComponents,
  'graph/course-schedule-ii': courseScheduleII,
  'graph/alien-dictionary': alienDictionary,
  'graph/matrix': matrix,
  'graph/word-ladder': wordLadder,
  'graph/rotting-oranges': rottingOranges,
  'graph/path-with-minimum-effort': pathMinimumEffort,
  'graph/cheapest-flights-within-k-stops': cheapestFlights,
  'graph/min-cost-to-connect-all-points': minCostConnectPoints,
  'graph/is-graph-bipartite': isGraphBipartite,
  'graph/clone-graph': cloneGraph,
  'graph/network-delay-time': networkDelayTime,
  'dp/house-robber': houseRobber,
  'dp/house-robber-ii': houseRobberII,
  'dp/decode-ways': decodeWays,
  'dp/unique-paths': uniquePaths,
  'dp/unique-paths-ii': uniquePathsII,
  'dp/minimum-path-sum': minimumPathSum,
  'dp/partition-equal-subset-sum': partitionEqualSubsetSum,
  'dp/target-sum': targetSum,
  'dp/coin-change': coinChange,
  'dp/coin-change-ii': coinChangeII,
  'dp/longest-common-subsequence': longestCommonSubsequence,
  'dp/edit-distance': editDistance,
  'dp/longest-increasing-subsequence': longestIncreasingSubsequence,
  'dp/longest-palindromic-substring': longestPalindromicSubstring,
  'dp/palindromic-substrings': palindromicSubstrings,
  'dp/longest-palindromic-subsequence': longestPalindromicSubsequence,
  'dp/burst-balloons': burstBalloons,
  'dp/best-time-to-buy-and-sell-stock-with-cooldown': stockCooldown,
  'dp/best-time-to-buy-and-sell-stock-iii': stockIII,
  'two-pointer/valid-palindrome': validPalindrome,
  'two-pointer/3sum': threeSum,
  'two-pointer/3sum-closest': threeSumClosest,
  'two-pointer/4sum': fourSum,
  'two-pointer/squares-of-a-sorted-array': squaresOfSortedArray,
  'two-pointer/reverse-string': reverseString,
  'two-pointer/remove-duplicates-from-sorted-array': removeDuplicates,
  'two-pointer/move-zeroes': moveZeroes,
  'two-pointer/merge-sorted-array': mergeSortedArray,
  'two-pointer/intersection-of-two-arrays-ii': intersectionOfTwoArrays,
  'two-pointer/linked-list-cycle-floyds-algorithm': linkedListCycleFloyd,
  'two-pointer/middle-of-the-linked-list': middleOfLinkedList,
  'two-pointer/remove-nth-node-from-end-of-list': removeNthNode,
  'two-pointer/palindrome-linked-list': palindromeLinkedList,
  'two-pointer/minimum-size-subarray-sum': minimumSizeSubarrayTwoPointer,
  'two-pointer/longest-substring-without-repeating-characters': longestSubstringTwoPointer,
  'sliding-window/minimum-size-subarray-sum': minimumSizeSubarray,
  'sliding-window/permutation-in-string': permutationInString,
  'sliding-window/find-all-anagrams-in-a-string': findAllAnagrams,
  'sliding-window/fruit-into-baskets': fruitIntoBaskets,
  'sliding-window/max-consecutive-ones-iii': maxConsecutiveOnes,
  'sliding-window/subarray-product-less-than-k': subarrayProductLessThanK,
  'sliding-window/maximum-number-of-vowels-in-a-substring-of-given-length': maximumNumberOfVowels,
  'sliding-window/longest-subarray-of-1s-after-deleting-one-element': longestSubarrayAfterDelete,
  'sliding-window/frequency-of-the-most-frequent-element': frequencyOfMostFrequent,
};

/**
 * @author NNicholas Starke
 * @link https://www.snip2code.com/Snippet/416971/JavaScript-L3-Cache-Test/
 */

// Theoretically, on average there should be no difference in access times
// in our two retrievals.  However, running this script
// will demonstrate that there is a marked difference between the
// the two retrievals.  The reason is because before the first retrieval,
// we make sure the L3 cache on the processor is full of the evictionBuffer.
// The first retrieval causes the value to be cached in L3, so that
// on the second retrieval, the processor does not have to go to RAM
// to retrieve the value.  Instead, it can retrieve it from L3.

// The third and the fourth tests are provided as controls to validate that we
// can reproduce the results by performing the same actions in a different order.

// we use this buffer to evict everything from L3
var evictionBuffer = new ArrayBuffer(8192 * 1024);
var evictionView = new DataView(evictionBuffer);

// we use this buffer to test retrieval
var probeBuffer = new ArrayBuffer(8192 * 1024);
var probeView = new DataView(probeBuffer);

// L3 cache line size
var offset = 64;

// bogus retrieval variable
var current;

// running counts
var flushedTotal = 0;
var unflushedTotal = 0;
var flushedControlTotal = 0;
var unflushedControlTotal = 0;

// run test 'rounds' number of times
var rounds = 1000;

for (var c = 0; c < rounds; c++) {

    // purge L3 cache to prime eviction set
    for (var i = 0; i < ((8192 * 1023) / offset); i++) {
        current = evictionView.getUint32(i * offset);
    }

    // first retrieval - comes from RAM
    var beginFirst = window.performance.now();
    current = probeView.getUint32(1);  //1 is the page
    var endFirst = window.performance.now();
    var diffFirst = endFirst - beginFirst;

    // second retrieval - comes from L3
    var beginSecond = window.performance.now();
    current = probeView.getUint32(1);  //1 is the page
    var endSecond = window.performance.now();
    var diffSecond = endSecond - beginSecond;

    // Control tests:

    // this test should be comparable to the second
    var beginThird = window.performance.now();
    current = probeView.getUint32(1);  //1 is the page
    var endThird = window.performance.now();
    var diffThird = endThird - beginThird;

    // purge L3 cache to prime eviction set
    for (var i = 0; i < ((8192 * 1023) / offset); i++) {
        current = evictionView.getUint32(i * offset);
    }

    // this test should be comparable to the first
    var beginFourth = window.performance.now();
    current = probeView.getUint32(1);  //1 is the page
    var endFourth = window.performance.now();
    var diffFourth = endFourth - beginFourth;

    // measure differences
    flushedTotal += diffFirst;
    unflushedTotal += diffSecond;
    flushedControlTotal += diffFourth;
    unflushedControlTotal += diffThird;
}

console.log({
    flushedAverage: flushedTotal / rounds,
    unflushedAverage: unflushedTotal / rounds,
    flushedControlAverage: flushedControlTotal / rounds,
    unflushedControlAverage: unflushedControlTotal / rounds
});

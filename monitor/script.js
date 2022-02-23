       function getData() {
            return Math.random();
        }

        Plotly.newPlot('accuracy-chart', [{
            y: [getData()],
            type: 'line'
        }]);

        var cnt = 0;
        setInterval(function () {
            Plotly.extendTraces('accuracy-chart', { y: [[getData()]] }, [0]);
            cnt++;

            if (cnt > 500) {
                Plotly.relayout('accuracy-chart', {
                    xaxis: {
                        range: [cnt - 500, cnt]
                    }
                });
            }

        }, 10);
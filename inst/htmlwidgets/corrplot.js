HTMLWidgets.widget({
  name: 'corrplot',
  type: 'output',

  initialize: function(el, width, height) {
     console.log("init")
  //定义div元素
	 var wrapDiv = d3.select(el)
		.append("div")
		.attr("id", "content-wrapper")
		.attr("width", "800px")//这里可不可以修改
//定义按钮
	var buttonHTML = '<div id="bottonBox" class="row" style="margin-top:-200px; width:900px"> <div class="col-md-2"> <p class="buttonLabel"> Order:</p>'+
		'<select id="orderSelect" style="width:80px"> <option value="original">original</option> <option value="AOE">AOE</option><option value="FPC">FPC</option>			<option value="hclust">hclust</option>			<option value="name">name</option>		</select>		</div>'+
		'<div class="col-md-4" >	<p class="buttonLabel"> DiagShow:</p>		<div id="diagDiv" class="btn-group" data-toggle="buttons">			<label class="btn btn-info">				<input type="radio" name="options" id="Upper" autocomplete="off"  value="Upper" > Upper			</label>			<label class="btn btn-info">				<input type="radio" name="options" id="Lower" autocomplete="off" value="Lower"> Lower			</label>			<label class="btn btn-info active">				<input type="radio" name="options" id="Full" autocomplete="off" value="Full" checked> Full			</label>		</div></div>'+
		'<div class="col-md-4" >		<p class="buttonLabel"> Legend:</p>			<div id="legendDiv" class="btn-group" data-toggle="buttons" style="position: relative">				<label class="btn btn-info active">					<input type="radio" name="legend" autocomplete="off" checked id="circle" value="Circle"> Circle				</label>				<label class="btn btn-info">					<input type="radio" name="legend" autocomplete="off" id="square"  value="Square"> Square				</label>				<label class="btn btn-info">					<input type="radio" name="legend" autocomplete="off" id="ellipse" value="Ellipse"> Ellipse				</label>			</div>	</div>'+
		'<div class="col-md-2" >		 <p class="buttonLabel"> Number: </p>		<button type="button" id="numShow" class="btn btn-outline-info" value="show">Show</button>	</div></div>'+
		'<br/><br/><br/>'
//在div元素中添加按钮
	var bottonDiv = d3.select(el)
		.append("div")
		.html(buttonHTML)
    return wrapDiv;
  },
/*               */
//el: the elements host the widget
//x:包括data和settings
//
  renderValue: function(el, x, wrapDiv) {
     console.log("render")
	 wrapDiv.selectAll("div").remove();
	 wrapDiv.selectAll("svg").remove();

	 var plotDiv = wrapDiv.append("div")
		.attr("class", "corrplot")
		.attr("id", "corrplot-1")

	var svgHTML = '	<svg xmlns="http://www.w3.org/2000/svg" version="1.1"><defs><linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#053061;stop-opacity:1" /><stop offset="50%" style="stop-color:#FFFFFF;stop-opacity:1" /><stop offset="100%" style="stop-color:#67001F;stop-opacity:1" /></linearGradient></defs></svg>'
//添加svg
	wrapDiv.append("svg")
		.html(svgHTML)
//添加svg元素

	var svg = plotDiv.append("svg")
      .attr("width", "950px")//这里可以修改
      .attr("height", "900px")//
	  .attr("id", "plotSVG");
	//console.log(svg.attr("id"))
	//console.log(el)
	//console.log(x)

    //instance.setOption(x, true);
	//instance.setTheme(eval(x.theme + "Theme"));
	mvisCorrplotData = x['data']

	//circles.on("mouseover.tooltip",overCell)
	var w = 950, h = 900, n = mvisCorrplotData["matrixLength"];
  //这个data中应该是从R的函数中获取的；
		lineStart = 100;
		lineEnd = 850;
		cellSize = (lineEnd - lineStart)/n;//cell的个数
		hLineArray = new Array(n+1);//水平线
		vLineArray = new Array(n+1);//垂直线
		maxR = 0.9 * cellSize;//应该是定义圈的最大最小值
		minR = 0.1 * cellSize;
		numShow = false;
		method = mvisCorrplotData["method"]
		diagShow = "diagFull";
		nofFill = 0;
		maxValue = 1;
		middleValue = 0;
		minValue = -1;

		maxCol = mvisCorrplotData["color"][0];
		middleCol = mvisCorrplotData["color"][1];
		minCol = mvisCorrplotData["color"][2];
		newSeq = mvisCorrplotData["orderList"]["original"]

//从html中选取
		$( "#legendDiv" ).buttonset();
		$( "#diagDiv" ).buttonset();
		$( "#numShow" ).button();

		$("bottonBox").css("margin-left")

		var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;//正则表达式
		String.prototype.colorHex = function(){
			var that = this;
			if(/^(rgb|RGB)/.test(that)){//test 是什么
				var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g,"").split(",");
				var strHex = "#";
				for(var i=0; i<aColor.length; i++){
					var hex = Number(aColor[i]).toString(16);
					if(hex === "0"){
						hex += hex;
					}
					strHex += hex;
				}
				if(strHex.length !== 7){
					strHex = that;
				}
				return strHex;
			}else if(reg.test(that)){
				var aNum = that.replace(/#/,"").split("");
				if(aNum.length === 6){
					return that;
				}else if(aNum.length === 3){
					var numHex = "#";
					for(var i=0; i<aNum.length; i+=1){
						numHex += (aNum[i]+aNum[i]);
					}
					return numHex;
				}
			}else{
				return that;
			}
		};
/*//*/
		String.prototype.colorRgb = function(){
			var sColor = this.toLowerCase();
			if(sColor && reg.test(sColor)){
				if(sColor.length === 4){
					var sColorNew = "#";
					for(var i=1; i<4; i+=1){
						sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));
					}
					sColor = sColorNew;
				}
				var sColorChange = [];
				for(var i=1; i<7; i+=2){
					sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));
				}
				return sColorChange;
			}else{
				return sColor;
			}
		};

		var parse_mvisCorrplotData = function(a){
			if (a.length==1){
				outArray = new Array(1)
				percent = (a[0] - middleValue)/(maxValue - middleValue);
				r = (percent*(maxR-minR)+minR)/2;
				cx = cellSize*(0.5) + lineStart;
				cy = cellSize*(0.5) + lineStart;
				color = colorSelector(a[0])//一个自定义函数
				outArray[0] = new Array(r, cx, cy, color, a[0], cellSize*0+lineStart, cellSize*0+lineStart )
				return outArray
			}else{
				outArray = new Array(n*n)
				for(var i = 0; i < n; i++){
					for(var j=0; j < n; j++){
						if (a[i][j] > middleValue) percent = (a[i][j] - middleValue)/(maxValue - middleValue);
						else percent = (middleValue - a[i][j])/(middleValue - minValue);
						r = (percent*(maxR-minR)+minR)/2;
						cx = cellSize*(j+0.5) + lineStart;
						cy = cellSize*(i+0.5) + lineStart;
						color = colorSelector(a[i][j])
						outArray[i*n+j] = new Array(r, cx, cy, color, a[i][j], cellSize*j+lineStart, cellSize*i+lineStart )
					}
				}
				return outArray;
			}
		}

//
		var colorSelector = function(v){

			var returnCol = new Array(3);
			if( (minValue <= v) && (maxValue >= v)){
				maxColRGB = maxCol.colorRgb()
				middleColRGB = middleCol.colorRgb()
				minColRGB = minCol.colorRgb()
				if (v > middleValue){
					percent = (v - middleValue)/(maxValue - middleValue)
					for (var i=0; i<3; i++){
						if (maxColRGB[i] > middleColRGB[i]) returnCol[i] = parseInt((maxColRGB[i] - middleColRGB[i]) * percent + middleColRGB[i]);
						else returnCol[i] = parseInt( middleColRGB[i] -(middleColRGB[i] - maxColRGB[i]) * percent);
					}
				}else{
					percent = (middleValue - v)/(middleValue - minValue);
					for (i=0; i<3; i++){
						if (minColRGB[i] < middleColRGB[i]) returnCol[i] = parseInt(middleColRGB[i] -(middleColRGB[i] - minColRGB[i]) * percent);
						else returnCol[i] =  parseInt((minRGB[i] - middleColRGB[i]) * percent + middleColRGB[i]);
					}
				}
				return("RGB(" + returnCol.join(",") + ")")
			}else{
				alert( v + "unexpected false.")
			}
		}


		for (i=0; i<n+1; i++){
			vLineArray[i] =  new Array(cellSize*i + lineStart, lineStart, cellSize*i + lineStart, lineEnd)
			hLineArray[i] = new Array(lineStart, cellSize*i + lineStart, lineEnd, cellSize*i + lineStart)
		}


		$( "#legend" ).buttonset();
		$( "#diag" ).buttonset();

	//circles.on("mouseout.tooltip",outCell)

	function init_corrplot( method){



	aData = parse_mvisCorrplotData(mvisCorrplotData["matrixData"])
	console.log(aData)

	if (method=="circle"){
		var cells = svg.selectAll(".cells").data(aData)
			.enter()
			.append("circle")
			/*changed 11-01 .attr("r", function(d){return d[0];})
			.attr("cx", function(d,i){ return d[1];})
			.attr("cy", function(d,i){ return d[2];})
			.attr("fill", function(d){return d[3];})
			.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("cell cell_Y_"+a1+" cell_X_"+a2);})
			.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("cell cell_Y_"+a1+" cell_X_"+a2);})
		*/
			.attr("r", function(d){return d[0];})
			.attr("fill", function(d){return d[3];})
			.attr("cx", function(d,i){ return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart);})
			.attr("cy", function(d,i){return (cellSize*( newSeq[i%n]-0.5) + lineStart);})
			.attr("class", function(d,i){ return("cell cell_Y_"+ (newSeq[i%n] -1) ) +" cell_X_"+ (newSeq[Math.floor(i/n)] -1);})



	}else if (method=="ellipse"){
		var cells = svg.selectAll(".cells").data(aData)
				.enter()
				.append("ellipse")
				/*changed 11-01 .append("ellipse")
				.attr("cx", function(d){return d[1];})
				.attr("cy", function(d){ return d[2];})
				.attr("fill", function(d){return d[3];})
				.attr("ry", function(d){return cellSize/2 - Math.abs(d[0]) ;})
				.attr("rx", cellSize/2)
				.attr("transform", function(d){ if (d[4]>0) {return "rotate( -45," + d[1] +","+d[2]+")"}else{ return "rotate( 45," + d[1] +","+d[2]+")"} })
				.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("cell cell_Y_"+a1+" cell_X_"+a2);})
		*/
				.attr("cx", function(d,i){ return (cellSize*(newSeq[Math.floor(i/n)] - 0.5)  + lineStart);})
				.attr("cy", function(d,i){ return (cellSize*( newSeq[i%n] - 0.5) + lineStart) ;})
				.attr("class", function(d,i){ return("cell cell_Y_"+ (newSeq[i%n] -1) ) +" cell_X_"+ (newSeq[Math.floor(i/n)] -1);})
				.attr("ry", function(d){return cellSize/2 - Math.abs(d[0]) ;})
				.attr("rx", cellSize/2)
				.attr("transform",function(d,i){
					if (d[4]>0) return "rotate( -45," + (cellSize*(newSeq[Math.floor(i/n)] - 0.5)  + lineStart) +","+(cellSize*( newSeq[i%n] - 0.5) + lineStart)+")";
					else return "rotate( 45," + (cellSize*(newSeq[Math.floor(i/n)] - 0.5)  + lineStart) +","+(cellSize*( newSeq[i%n] - 0.5) + lineStart)+")"})
				.attr("fill", function(d){return d[3];})


	}else if (method == "square"){
		var cells = svg.selectAll(".cells").data(aData)
				.enter()
				.append("rect")
				/*changed 11-01 .attr("x", function(d){return d[1] - d[0];})
				.attr("y", function(d){ return d[2] - d[0];})
				.attr("fill", function(d){return d[3];})
				.attr("width", function(d){return 2*d[0]})
				.attr("height", function(d){return 2*d[0]})
				.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("cell cell_Y_"+a1+" cell_X_"+a2);})
				*/
				.attr("fill", function(d){return d[3];})
				.attr("width", function(d){return 2*d[0]})
				.attr("height", function(d){return 2*d[0]})
				.attr("x", function(d,i){return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart) - d[0];})
				.attr("y", function(d,i){ return (cellSize*( newSeq[i%n]-0.5) + lineStart) - d[0];})
				.attr("class", function(d,i){ return("cell cell_Y_"+ (newSeq[i%n] -1) ) +" cell_X_"+ (newSeq[Math.floor(i/n)] -1);})

				}
	/*	info = "x:"+ 0+";y:"+0
	var infoLabel = svg.selectAll(".info").data([1]).enter().append("text")
			.attr("x", 20).attr("y",20)
			.text(info).attr("class","info")
	*/
	console.log(newSeq)
			var numLabel = svg.selectAll(".numLabelNormal").data(aData).enter().append("text")
				.attr("x", function(d,i){ return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart);})
				.attr("y", function(d,i){ return (cellSize*( newSeq[i%n]-0.5) + lineStart-5);})
				.attr("class", function(d,i){ return("numLabelNormal numLabel_Y_"+ (newSeq[i%n] -1) ) +" numLabel_X_"+ (newSeq[Math.floor(i/n)] -1);})
				.text(function(d){return(parseFloat(d[4]).toFixed(3));})
				.attr("fill", function(d){ return (parseFloat(d[4])>middleValue) ? "#ffa500":"green"})
				.attr("visibility", function(d, i) {
					a1 = newSeq[Math.floor(i/n)];
					a2 = newSeq[i%n];
					if (numShow){
						if (diagShow=="diagLower"){
							return  a1>a2?"hidden":"visible";
						}else if(diagShow=="diagUpper"){
							return  a1<a2?"hidden":"visible";
						}else if(diagShow=="diagFull"){
							return "visible";}
					}else{
						return "hidden";
						}
					})
				.attr("font-size","8px")

	var rect = svg.selectAll(".rect").data(aData).enter().append("rect")
				.attr("x", function(d,i){return  d[5]})
				.attr("y", function(d,i){return  d[6]})
				.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("rectCellNormal rect_Y_"+a1+" rect_X_"+a2);})
				.attr("width",cellSize)
				.attr("height",cellSize)
				.attr("stroke", "grey")
				.attr("fill","grey")
				.style("opacity", 0)


	// Fixed
	var axisLabel_Y = svg.selectAll(".axis_YNormal").data(mvisCorrplotData["colNames"]).enter().append("text")
			.attr("class", function(d,i){return "axis_YNormal text_Y_" + (newSeq[i]-1)})
			.attr("x", lineStart-3)
			.attr("y", function(d,i){return (newSeq[i]-0.5)*cellSize+lineStart+5;})
			.text(function(d){return d;})
			.attr("font-size","15px")

	//Fixed
	var axisLabel_X = svg.selectAll(".axis_XNormal").data(mvisCorrplotData["colNames"]).enter().append("text")
		.attr("class", function(d,i){return "axis_XNormal text_X_" + (newSeq[i]-1) })
		.attr("x", lineStart+3)
		.attr("y", function(d,i){return (newSeq[i]-0.5)*cellSize+lineStart+5;})
		.attr("transform", "rotate(-90,"+lineStart+","+lineStart+")")
		.text(function(d){return d;})

	var yLines = svg.selectAll(".yLines").data(vLineArray).enter().append("line")
				.attr("x1", function(d,i){return d[0];})
				.attr("y1", function(d,i){return d[1];})
				.attr("x2", function(d,i){return d[0];})
				.attr("y2", function(d,i){return d[1];})
				.attr("stroke", "gray").attr("stroke-width",1)
				.attr("class", "yLines")

	yLines.transition().duration(800).delay(500)
				.attr("x2", function(d,i){return d[2];})
				.attr("y2", function(d,i){return d[3];})
				.attr("stroke", "gray").attr("stroke-width",1)

	var xLines = svg.selectAll(".xLines").data(hLineArray).enter().append("line")
				.attr("x1", function(d,i){return d[0];})
				.attr("y1", function(d,i){return d[1];})
				.attr("x2", function(d,i){return d[0];})
				.attr("y2", function(d,i){return d[1];})
				.attr("stroke", "gray").attr("stroke-width",1)
				.attr("class", "xLines")


	xLines.transition().duration(800).delay(1000)
				.attr("x2", function(d,i){return d[2];})
				.attr("y2", function(d,i){return d[3];})
				.attr("stroke", "gray").attr("stroke-width",1)


	gradientColor = [maxCol, middleCol, minCol]

	var drawLegend = function(){
			var legend = svg.selectAll("legend")
					.data([1]).enter()
					.append("g")
			var legendWidth = 30;
			var rectGradient = legend.selectAll("rectgradient")
					.data([1])
					.enter().append("rect")
					.attr("id", "rectGradient")
					.attr("x", w-80)
					.attr("y", lineStart)
					.attr("width", legendWidth)
					.attr("height", cellSize*n)
					.attr("fill","url(#grad2)")



			var legendLabelDefine =  function(maxValue, minValue){
				nOfLabel = 11;
				heightStep = cellSize*n/(nOfLabel-1)
				numStep = (maxValue-minValue)/(nOfLabel-1)
				var returnArray = new Array()
				for (i=0; i<nOfLabel; i++){
					returnArray.push(new Array(w-80+legendWidth, lineStart+(i*heightStep), parseFloat(maxValue-i*numStep).toFixed(1) ))
				}

				return returnArray;
			}


			var legendData = legendLabelDefine(maxValue, minValue)
			var legendGroup = legend.selectAll(".legendGroup")
					.data(legendData)
					.enter()
					.append("g")

			var legendLine = legendGroup.selectAll(".legendLine")
					.data(legendData)
					.enter()
					.append("line")
					.attr("x1", function(d){return d[0];})
					.attr("y1", function(d){return (d[1] + (parseFloat(d[2])>middleValue?1:-1) );})
					.attr("x2", function(d){return d[0]+5;})
					.attr("y2", function(d){return (d[1] +  (parseFloat(d[2]) > middleValue?1:-1) );})
					.attr("stroke", "gray").attr("stroke-width",1)

			var legendText = legendGroup.selectAll(".legendText")
					.data(legendData)
					.enter()
					.append("text")
					.attr("x", function(d){return d[0] +8;})
					.attr("y", function(d){return (d[1]+  (parseFloat(d[2])>middleValue?1:-1));})
					.text( function(d){return d[2];})
					//.style("text-anchor","middle")
					.style("dominant-baseline","central")
		}
	drawLegend();


	var overCell =  function(d,i){
			var y = Math.floor(i/n)
				x = i%n

			if (method=="circle"){
				svg.selectAll(".cell_Y_"+y).transition().duration(500).delay(200)
					.attr("r", function(d){return d[0]*1.1;})

				svg.selectAll(".cell_X_"+x).transition().duration(500).delay(200)
					.attr("r", function(d){return d[0]*1.1;})
			}else if (method == "ellipse"){
				svg.selectAll(".cell_Y_"+y).transition().duration(500).delay(200)
					.attr("ry", function(d){return 1.1*(cellSize/2 - Math.abs(d[0]));})

				svg.selectAll(".cell_X_"+x).transition().duration(500).delay(200)
					.attr("ry", function(d){return 1.1*(cellSize/2 - Math.abs(d[0]));})
			}else if (method == "square"){
				svg.selectAll(".cell_Y_"+y).transition().duration(500).delay(200)
					.attr("width", function(d){return 2.2*d[0]})
					.attr("height", function(d){return 2.2*d[0]})
				svg.selectAll(".cell_X_"+x).transition().duration(500).delay(200)
					.attr("width", function(d){return 2.2*d[0]})
					.attr("height", function(d){return 2.2*d[0]})
			}
			info = "x:"+ x+";y:"+y

			//svg.selectAll(".info")
				//.transition().duration(100).delay(200)
			//.text(info)



			svg.selectAll(".rect_X_"+x).transition().duration(100).delay(200)
				.style("opacity", 0.2)
			svg.selectAll(".rect_Y_"+y).transition().duration(100).delay(200)
				.style("opacity", 0.2)
				svg.selectAll(".numLabelNormal").data(aData).enter().append("text")


			svg.selectAll(".numLabel_Y_"+y).transition().duration(500).delay(200)
				.attr("visibility", function(d,i){
					if (diagShow=="diagLower"){
						return  newSeq[i] > y+1 ?"hidden":"visible";
					}else if(diagShow=="diagUpper"){
						return  newSeq[i] <= y ?"hidden":"visible";
					}else if(diagShow=="diagFull"){
						return "visible";}
					})
				.attr("font-size","12px")  //visible

			svg.selectAll(".numLabel_X_"+x).transition().duration(500).delay(200)
				.attr("visibility", function(d,i){
					if (diagShow=="diagLower"){
						return  newSeq[i] < x+1 ?"hidden":"visible";
					}else if(diagShow=="diagUpper"){
						return  newSeq[i] > x+1 ?"hidden":"visible";
					}else if(diagShow=="diagFull"){
						return "visible";}
					})
				.attr("font-size","12px")


			svg.select(".text_Y_"+y).transition().duration(500).delay(200)
				.attr("font-size", "23px")
				.attr("font-weight","bold")
				.attr("fill","#f00")


			if (diagShow == "diagLower"){
				svg.select(".text_X_"+x).transition().duration(200).delay(200)
					.attr("x", (x+0.5)*cellSize+lineStart-5)
					.attr("y", lineStart-15+ x*cellSize)
					.attr("font-size", "23px")
					.attr("font-weight","bold")
					.attr("fill","#f00")
					.attr("transform", "")
					.attr("text-anchor", "middle")
			}else{
				svg.select(".text_X_"+x).transition().duration(200).delay(200)
				.attr("x", (x+0.5)*cellSize+lineStart-5)
				.attr("y", lineStart-15)
				.attr("font-size", "23px")
				.attr("font-weight","bold")
				.attr("fill","#f00")
				.attr("transform", "")
				.attr("text-anchor", "middle")

			}

	}

	var outCell = function(d,i){


		var y = Math.floor(i/n)
			x = i%n
		//alert(numShow)
			//alert("x:"+ x+"y:"+y)
			svg.selectAll(".numLabelNormal").transition().duration(500).delay(200)
			.attr("visibility", function(u,m){
				if (numShow == true){
					a1 = newSeq[Math.floor(m/n)];
					a2 = newSeq[m%n];
					if (diagShow=="diagLower"){
						return  a1>a2?"hidden":"visible";
					}else if(diagShow=="diagUpper"){
						return  a1<a2?"hidden":"visible";
					}else if(diagShow=="diagFull"){
						return "visible";}
					}else{
						return "hidden";
					}
				})
			.attr("font-size","9px")//visible


		svg.selectAll("rect.tmp_rectv").transition().duration(500).delay(200)
			.remove()
		svg.selectAll("rect.tmp_recth").transition().duration(500).delay(200)
			.remove()

		if (method=="circle"){
		svg.selectAll(".cell_Y_"+y).transition().duration(500).delay(200)
			.attr("r", function(d){return d[0];})

		svg.selectAll(".cell_X_"+x).transition().duration(500).delay(200)
			.attr("r", function(d){return d[0];})
		}else if (method == "ellipse"){
		svg.selectAll(".cell_Y_"+y).transition().duration(500).delay(200)
			.attr("ry", function(d){return (cellSize/2 - Math.abs(d[0]));})

		svg.selectAll(".cell_X_"+x).transition().duration(500).delay(200)
			.attr("ry", function(d){return (cellSize/2 - Math.abs(d[0]));})
		}else if (method == "square"){
		svg.selectAll(".cell_Y_"+y).transition().duration(500).delay(200)
			.attr("width", function(d){return 2*d[0]})
			.attr("height", function(d){return 2*d[0]})
		svg.selectAll(".cell_X_"+x).transition().duration(500).delay(200)
			.attr("width", function(d){return 2*d[0]})
			.attr("height", function(d){return 2*d[0]})
		}

		svg.selectAll(".rect_X_"+x).transition().duration(100).delay(200)
			.style("opacity", 0)
		svg.selectAll(".rect_Y_"+y).transition().duration(100).delay(200)
			.style("opacity", 0)

		svg.select(".text_Y_"+y).transition().duration(500).delay(200)
			.attr("font-size", "15px")
			.attr("font-weight","normal")
			.attr("fill","black")

		svg.select(".text_X_"+x).transition().duration(200).delay(200)
			.attr("x", lineStart+3 - x*cellSize)
			//.attr("x", lineStart+3)
			.attr("y", (x+0.5)*cellSize+lineStart+5)
			.attr("transform", "rotate(-90,"+lineStart+","+lineStart+")")
			.attr("font-size", "15px")
			.attr("font-weight","normal")
			.attr("fill","black")
			.attr("text-anchor", "left")

		if (diagShow == "diagLower"){
				svg.select(".text_X_"+x).transition().duration(200).delay(200)
					.attr("x", lineStart+3 - x*cellSize)
					//.attr("x", lineStart+3)
					.attr("y", (x+0.5)*cellSize+lineStart+5)
					.attr("transform", "rotate(-90,"+lineStart+","+lineStart+")")
					.attr("font-size", "15px")
					.attr("font-weight","normal")
					.attr("fill","black")
					.attr("text-anchor", "left")

			}else{
				svg.select(".text_X_"+x).transition().duration(200).delay(200)
					.attr("x", lineStart+3)
					.attr("y", (x+0.5)*cellSize+lineStart+5)
					.attr("transform", "rotate(-90,"+lineStart+","+lineStart+")")
					.attr("font-size", "15px")
					.attr("font-weight","normal")
					.attr("fill","black")
					.attr("text-anchor", "left")

			}


	}


	rect.on("mouseover.tooltip",overCell)
	rect.on("mouseout.tooltip",outCell)


	$('button[id=numShow]').click(
		function(){
			if ($(this).val()=="show"){
				numShow = true;
				$("#numShow").text("Hidden")
				$("#numShow").val("hidden")
				svg.selectAll(".numLabelNormal")
				.attr("visibility", function(u,m){
						if (numShow == true){
							a1 = newSeq[Math.floor(m/n)];
							a2 = newSeq[m%n];
							if (diagShow=="diagLower"){
								return  a1>a2?"hidden":"visible";
							}else if(diagShow=="diagUpper"){
								return  a1<a2?"hidden":"visible";
							}else if(diagShow=="diagFull"){
								return "visible";}
							}else{
								return "hidden";
							}
						})
			}else{
				numShow = false;
				$("#numShow").text("Show")
				$("#numShow").val("show")

				svg.selectAll(".numLabelNormal").attr("visibility", "hidden")
			}
		}
	)

	$('#legendDiv').on('change', function() {
		//console.log( $('#diagDiv input:radio:checked').attr("id"));

		d3.selectAll(".cell").remove()

		//method = "diag" + $('#diagDiv input:radio:checked').attr("id");
		method = $('#legendDiv input:radio:checked').attr("id");
		console.log( $('#legendDiv input:radio:checked').attr("id"));

	if (method=="circle"){

		var cells = svg.selectAll(".cells").data(aData)
			.enter()
			.append("circle")
			/*changed 11-01 .attr("r", function(d){return d[0];})
			.attr("cx", function(d,i){ return d[1];})
			.attr("cy", function(d,i){ return d[2];})
			.attr("fill", function(d){return d[3];})
			.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("cell cell_Y_"+a1+" cell_X_"+a2);})
		*/
			.attr("r", function(d){return d[0];})
			.attr("fill", function(d){return d[3];})
			.attr("cx", function(d,i){ return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart);})
			.attr("cy", function(d,i){return (cellSize*( newSeq[i%n]-0.5) + lineStart);})
			.attr("class", function(d,i){ return("cell cell_Y_"+ (newSeq[i%n] -1) ) +" cell_X_"+ (newSeq[Math.floor(i/n)] -1);})


	}else if (method=="ellipse"){
		var cells = svg.selectAll(".cells").data(aData)
				.enter()
				.append("ellipse")
				/*changed 11-01 .append("ellipse")
				.attr("cx", function(d){return d[1];})
				.attr("cy", function(d){ return d[2];})
				.attr("fill", function(d){return d[3];})
				.attr("ry", function(d){return cellSize/2 - Math.abs(d[0]) ;})
				.attr("rx", cellSize/2)
				.attr("transform", function(d){ if (d[4]>0) {return "rotate( -45," + d[1] +","+d[2]+")"}else{ return "rotate( 45," + d[1] +","+d[2]+")"} })
				.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("cell cell_Y_"+a1+" cell_X_"+a2);})
		*/
				.attr("cx", function(d,i){ return (cellSize*(newSeq[Math.floor(i/n)] - 0.5)  + lineStart);})
				.attr("cy", function(d,i){ return (cellSize*( newSeq[i%n] - 0.5) + lineStart) ;})
				.attr("class", function(d,i){ return("cell cell_Y_"+ (newSeq[i%n] -1) ) +" cell_X_"+ (newSeq[Math.floor(i/n)] -1);})
				.attr("ry", function(d){return cellSize/2 - Math.abs(d[0]) ;})
				.attr("rx", cellSize/2)
				.attr("transform",function(d,i){
					if (d[4]>0) return "rotate( -45," + (cellSize*(newSeq[Math.floor(i/n)] - 0.5)  + lineStart) +","+(cellSize*( newSeq[i%n] - 0.5) + lineStart)+")";
					else return "rotate( 45," + (cellSize*(newSeq[Math.floor(i/n)] - 0.5)  + lineStart) +","+(cellSize*( newSeq[i%n] - 0.5) + lineStart)+")"})
				.attr("fill", function(d){return d[3];})


	}else if (method == "square"){
		var cells = svg.selectAll(".cells").data(aData)
				.enter()
				.append("rect")
				/*changed 11-01 .attr("x", function(d){return d[1] - d[0];})
				.attr("y", function(d){ return d[2] - d[0];})
				.attr("fill", function(d){return d[3];})
				.attr("width", function(d){return 2*d[0]})
				.attr("height", function(d){return 2*d[0]})
				.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("cell cell_Y_"+a1+" cell_X_"+a2);})
				*/
				.attr("fill", function(d){return d[3];})
				.attr("width", function(d){return 2*d[0]})
				.attr("height", function(d){return 2*d[0]})
				.attr("x", function(d,i){return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart) - d[0];})
				.attr("y", function(d,i){ return (cellSize*( newSeq[i%n]-0.5) + lineStart) - d[0];})
				.attr("class", function(d,i){ return("cell cell_Y_"+ (newSeq[i%n] -1) ) +" cell_X_"+ (newSeq[Math.floor(i/n)] -1);})
		}


		svg.selectAll(".numLabelNormal").remove()
		var numLabel = svg.selectAll(".numLabelNormal").data(aData).enter().append("text")
					.attr("x", function(d,i){ return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart);})

					.attr("y", function(d,i){ return (cellSize*( newSeq[i%n]-0.5) + lineStart-5);})
					.attr("class", function(d,i){ return("numLabelNormal numLabel_Y_"+ (newSeq[i%n] -1) ) +" numLabel_X_"+ (newSeq[Math.floor(i/n)] -1);})
					.text(function(d){return(parseFloat(d[4]).toFixed(3));})
					.attr("fill", function(d){ return (parseFloat(d[4])>middleValue) ? "orange":"green"})
					//.attr("visibility", "hidden")
					.attr("font-size","9px")

		svg.selectAll(".rectCellNormal").remove()
		rect = svg.selectAll(".rectCellNormal")
					.data(aData).enter().append("rect")
					.attr("x", function(d,i){return  d[5]})
					.attr("y", function(d,i){return  d[6]})
					.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("rectCellNormal rect_Y_"+a1+" rect_X_"+a2);})
					.attr("width",cellSize)
					.attr("height",cellSize)
					.attr("stroke", "red")
					.attr("fill","grey")
					.style("opacity", 0)

		diagInit("diag" + $('#diagDiv input:radio:checked').attr("id"))
	rect.on("mouseover.tooltip",overCell)
	rect.on("mouseout.tooltip",outCell)



	});

	function diagInit(diagShow){

		var t = svg.transition().duration(500);

		var cells = t.selectAll(".cell")
				cells.attr("visibility", function(d, i) {
					a1 = newSeq[Math.floor(i/n)];
					a2 = newSeq[i%n];
					if (diagShow=="diagLower"){
						return  a1>a2?"hidden":"visible";
					}else if(diagShow=="diagUpper"){
						return  a1<a2?"hidden":"visible";
					}else if(diagShow=="diagFull"){
						return "visible";}})

			var rects = t.selectAll(".rectCellNormal")
				rects.attr("visibility", function(d, i) {
					a1 = Math.floor(i/n);
					a2 = i%n;

					if (diagShow=="diagLower"){
						return  a1<a2?"hidden":"visible";
					}else if(diagShow=="diagUpper"){
						return  a1>a2?"hidden":"visible";
					}else if(diagShow=="diagFull"){
						return "visible";}})

			var numLabel = t.selectAll(".numLabelNormal")
				numLabel.attr("visibility", function(d, i) {
					a1 = newSeq[Math.floor(i/n)];
					a2 = newSeq[i%n];
					if (numShow){
						if (diagShow=="diagLower"){
							return  a1>a2?"hidden":"visible";
						}else if(diagShow=="diagUpper"){
							return  a1<a2?"hidden":"visible";
						}else if(diagShow=="diagFull"){
							return "visible";}
					}else{
						return "hidden";
						}
					})

			if (diagShow=="diagLower"){
				var axisLabel_Y = t.selectAll(".axis_YNormal")
						.attr("x", lineStart-3)
				var axisLabel_X = t.selectAll(".axis_XNormal")
						.attr("x", function(d,i){return(lineStart+3 - (newSeq[i]-1)*cellSize)})

				t.selectAll(".yLines")
					.attr("x1", function(d,i){return d[0];})
					.attr("y1", function(d,i){if (i>0)return ((i-1)*cellSize+lineStart); else return d[0];})
					.attr("x2", function(d,i){return d[2];})
					.attr("y2", function(d,i){return d[3];})
				t.selectAll(".xLines")
					.attr("x1", function(d,i){return d[0];})
					.attr("y1", function(d,i){return d[1];})
					.attr("x2", function(d,i){if (i<n)return ((i+1)*cellSize+lineStart); else return d[3];})
					.attr("y2", function(d,i){return d[3];})

			}else if (diagShow=="diagUpper"){

				var axisLabel_Y = t.selectAll(".axis_YNormal")
						.attr("x", function(d,i){return(lineStart-3 + (newSeq[i]-1)*cellSize)})
				var axisLabel_X = t.selectAll(".axis_XNormal")
						.attr("x", lineStart+3)

				t.selectAll(".yLines")
					.attr("x1", function(d,i){return d[0];})
					.attr("y1", function(d,i){return d[1];})
					.attr("x2", function(d,i){return d[2];})
					.attr("y2", function(d,i){if (i<n)return ((i+1)*cellSize+lineStart); else return d[3];})
				t.selectAll(".xLines")
					.attr("x1", function(d,i){if (i>0)return ((i-1)*cellSize+lineStart); else return d[0];})
					.attr("y1", function(d,i){return d[1];})
					.attr("x2", function(d,i){return d[2];})
					.attr("y2", function(d,i){return d[3];})

			}else{
				var axisLabel_Y = t.selectAll(".axis_YNormal")
						.attr("x", lineStart-3)
				var axisLabel_X = t.selectAll(".axis_XNormal")
						.attr("x", lineStart+3)

				t.selectAll(".yLines")
					.attr("x1", function(d,i){return d[0];})
					.attr("y1", function(d,i){return d[1];})
					.attr("x2", function(d,i){return d[2];})
					.attr("y2", function(d,i){return d[3];})
				t.selectAll(".xLines")
					.attr("x1", function(d,i){return d[0];})
					.attr("y1", function(d,i){return d[1];})
					.attr("x2", function(d,i){return d[2];})
					.attr("y2", function(d,i){return d[3];})
			}


		/*var axisLabel_Y = svg.selectAll(".axis_Y").data(mvisCorrplotData["colNames"]).enter().append("text")
			.attr("class", function(d,i){return "axis_Y text_Y_" + (newSeq[i]-1)})
			.attr("x", lineStart-3)
			.attr("y", function(d,i){return (newSeq[i]-0.5)*cellSize+lineStart+5;})
			.text(function(d){return d;})
			.attr("font-size","18px")
	var axisLabel_X = svg.selectAll(".axis_X").data(mvisCorrplotData["colNames"]).enter().append("text")
		.attr("class", function(d,i){return "axis_X text_X_" + (newSeq[i]-1) })
		.attr("x", lineStart+3)
		.attr("y", function(d,i){return (newSeq[i]-0.5)*cellSize+lineStart+5;})
		.attr("transform", "rotate(-90,"+lineStart+","+lineStart+")")
		.text(function(d){return d;})
	*/



	};


	function changeSeq(newSeq, method){



		var t = svg.transition().duration(500);
		t.selectAll(".axis_YNormal")
			.delay(function(d, i) { return i * 40; })
			.attr("x", function(d,i){if(diagShow=="diagUpper") {return(lineStart-3 + (newSeq[i]-1)*cellSize);} else {return(lineStart-3)}})
			.attr("y", function(d,i){return (newSeq[i]-0.5)*cellSize+lineStart+5;})
			.attr("class", function(d,i){return "axis_YNormal text_Y_" + (newSeq[i]-1)})
			//.attr("transform", function(d, i) {return "translate(0," + ((newSeq[i]-i-1)*cellSize) + ")"; })

		t.selectAll(".axis_XNormal")
			.delay(function(d, i) { return i * 40; })
			.attr("x", function(d,i){ if (diagShow=="diagLower") {return(lineStart+3 - (newSeq[i]-1)*cellSize)} else {return(lineStart+3)}})
			.attr("y", function(d,i){return (newSeq[i]-0.5)*cellSize+lineStart+5;})
			.attr("class", function(d,i){return "axis_XNormal text_X_" + (newSeq[i]-1) })

	/*.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("cell cell_Y_"+a1+" cell_X_"+a2);})
					.attr("cx", function(d){return d[1];})
				.attr("cy", function(d){ return d[2];})
				.attr("fill", function(d){return d[3];})
				.attr("ry", function(d){return cellSize/2 - Math.abs(d[0]) ;})
				.attr("rx", cellSize/2)
				.attr("transform", function(d){ if (d[4]>0) {return "rotate( -45," + d[1] +","+d[2]+")"}else{ return "rotate( 45," + d[1] +","+d[2]+")"} })
				.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("cell cell_Y_"+a1+" cell_X_"+a2);})
		*/

		//cellSize*(j+0.5) + lineStart
		if(method == "ellipse"){
			t.selectAll(".cell")
				.delay(function(d, i) { return i * 4; })
				.attr("cx", function(d,i){ return (cellSize*(newSeq[Math.floor(i/n)] - 0.5)  + lineStart);})
				.attr("cy", function(d,i){ return (cellSize*( newSeq[i%n] - 0.5) + lineStart) ;})
				.attr("class", function(d,i){ return("cell cell_Y_"+ (newSeq[i%n] -1) ) +" cell_X_"+ (newSeq[Math.floor(i/n)] -1);})
				.attr("transform",function(d,i){
					if (d[4]>0) return "rotate( -45," + (cellSize*(newSeq[Math.floor(i/n)] - 0.5)  + lineStart) +","+(cellSize*( newSeq[i%n] - 0.5) + lineStart)+")";
					else return "rotate( 45," + (cellSize*(newSeq[Math.floor(i/n)] - 0.5)  + lineStart) +","+(cellSize*( newSeq[i%n] - 0.5) + lineStart)+")"})

		}else if (method == "circle"){
			t.selectAll(".cell")
				.delay(function(d, i) { return i * 4; })
				.attr("cx", function(d,i){ return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart);})
				.attr("cy", function(d,i){return (cellSize*( newSeq[i%n]-0.5) + lineStart);})
				.attr("class", function(d,i){ return("cell cell_Y_"+ (newSeq[i%n] -1) ) +" cell_X_"+ (newSeq[Math.floor(i/n)] -1);})
				//.attr("transform",function(d){ if (d[4]>0) {return "rotate( -45," + (cellSize*( 1.5) + lineStart) +","+(cellSize*( 1.5) + lineStart)+")"}
				//	else{ return "rotate( 45," + (cellSize*( newSeq[Math.floor(i/n)]+0.5) + lineStart) +","+(cellSize*( newSeq[i%n]+0.5) + lineStart)+")"} })
		}else if (method == "square") {
			t.selectAll(".cell")
				.delay(function(d, i) { return i * 4; })
				.attr("x", function(d,i){return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart) - d[0];})
				.attr("y", function(d,i){ return (cellSize*( newSeq[i%n]-0.5) + lineStart) - d[0];})
				.attr("class", function(d,i){ return("cell cell_Y_"+ (newSeq[i%n] -1) ) +" cell_X_"+ (newSeq[Math.floor(i/n)] -1);})
		}

		t.selectAll(".numLabelNormal")
				//.attr("visibility", "visible")
				.attr("x", function(d,i){ return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart);})
				.attr("y", function(d,i){ return (cellSize*( newSeq[i%n]-0.5) + lineStart-5);})
				.attr("class", function(d,i){ return("numLabelNormal numLabel_Y_"+ (newSeq[i%n] -1) ) +" numLabel_X_"+ (newSeq[Math.floor(i/n)] -1);})
				//.text(function(d,i) {return(newSeq[Math.floor(i/n)] + ";" + newSeq[i%n])})
				//.attr("transform",function(d){ if (d[4]>0) {return "rotate( -45," + (cellSize*( 1.5) + lineStart) +","+(cellSize*( 1.5) + lineStart)+")"}
				//	else{ return "rotate( 45," + (cellSize*( newSeq[Math.floor(i/n)]+0.5) + lineStart) +","+(cellSize*( newSeq[i%n]+0.5) + lineStart)+")"} })



		var cells = t.selectAll(".cell")
				cells.attr("visibility", function(d, i) {
					a1 = newSeq[Math.floor(i/n)];
					a2 = newSeq[i%n];
					if (diagShow=="diagLower"){
						return  a1>a2?"hidden":"visible";
					}else if(diagShow=="diagUpper"){
						return  a1<a2?"hidden":"visible";
					}else if(diagShow=="diagFull"){
						return "visible";}})

			var rects = t.selectAll(".rectCellNormal")
				rects.attr("visibility", function(d, i) {
					a1 = Math.floor(i/n);
					a2 = i%n;

					if (diagShow=="diagLower"){
						return  a1<a2?"hidden":"visible";
					}else if(diagShow=="diagUpper"){
						return  a1>a2?"hidden":"visible";
					}else if(diagShow=="diagFull"){
						return "visible";}})

			var numLabel = t.selectAll(".numLabelNormal")
				numLabel.attr("visibility", function(d, i) {
					a1 = newSeq[Math.floor(i/n)];
					a2 = newSeq[i%n];
					if (numShow){
						if (diagShow=="diagLower"){
							return  a1>a2?"hidden":"visible";
						}else if(diagShow=="diagUpper"){
							return  a1<a2?"hidden":"visible";
						}else if(diagShow=="diagFull"){
							return "visible";}
					}else{
						return "hidden";
						}
					})


	}


	d3.select("#orderSelect").on("change", function() {
		console.log(1233332)
		newSeq = mvisCorrplotData["orderList"][this.value]; changeSeq(newSeq , method=method)

	});


	$('#diagDiv').on('change', function(){
			diagShow = "diag" + $('#diagDiv input:radio:checked').attr("id")

			diagInit(diagShow)
	});


		//var rects = svg.selectAll(".rect")

	}
	init_corrplot(method="circle")

  },

  resize: function(el, width, height, instance) {
  }

});

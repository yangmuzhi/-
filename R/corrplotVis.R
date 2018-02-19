# corrplot use HTML5
#
# This is an plot function for html5Vis
# which generates 'corrplot' html files viewed by Chrome.
#
# You can learn more about corrplot by using 'corrplot' package:
#
#
#
#' @export
#' @examples
#' data(mtcars)
#' M <- cor(mtcars)
#'
#' bfdVis::corrplotVis(cor(mtcars))
#' bfdVis::corrplotVis(cor(t(mtcars[1:25,])))
#' corrplotVis(M)
corrplotVis <- function(corr, color = NULL, size=c(950,900),
		widthRange = c(100,1000)
) {
	# settings = NULL,
	 #corr = cor(mtcars)
	#判断是否是相关性矩阵
	 if(!is.matrix(corr)&!is.data.frame(corr))
		stop("Need a matrix or data frame!")

	orderList = .orderListGenerate(corr, orderList = c("original", "AOE", "FPC", "hclust", "name"))#一个自定函数
	#,使用不同的算法，order，来实现变量顺序的变化。
	if(is.null(color)){
		color = c("#053061", "#FFFFFF", "#67001F")
	}else{
		color = colorRampPalette(color)(3)#为什么要选择(3)  生成颜色
	}
##去除corr矩阵的名称
	corr <- as.matrix(corr)
	colNames = colnames(corr)
	colnames(corr) = NULL
	rownames(corr) = NULL
##
	if (ncol(corr) == 1){##ncol只有1列
		outList <- list(
				matrixLength = ncol(corr),
				color = color,
				colNames = as.matrix(colNames),
				matrixData = corr,
				#method = method,
				#type = type,
				#order = order
				orderList = orderList
		)
		#return (outList)
	}else{
		outList <- list(
				matrixLength = ncol(corr),
				color = color,
				colNames = colNames,
				matrixData = corr,
				#method = method,
				#type = type,
				#order = order
				orderList = orderList
		)
		#return (outList)

	}
##
##CI,sigLevel
CI <- list()

CI$p <- corrplot::cor.mtest(corr)$p
###hclust seq
rectOrderNum <- list()
tree <- hclust(as.dist(1-corr),method = "complete")
hc <- cutree(tree, k = c(2,3,4))
hcOrder <- hc[order(orderList$hclust),]
##
rectNum <- function(hcOrder){

returnNum <- NULL 
for(i in unique(hcOrder)){
returnNum  <-c(returnNum ,max(which(hcOrder==i)))
}
return(returnNum)
}


rectOrderNum <- apply(hcOrder,2,rectNum)

names(rectOrderNum)<- c("a","b","c")
###
	x <- list(
		data = outList,
		size = size,
		CI = CI,
		rectOrderNum = rectOrderNum,
		range = widthRange
	)
	#print(x)

	chart = htmlwidgets::createWidget(
		'corrplot', x,
		package = 'bfdVis', width = size[1], height = size[2],
		preRenderHook = function(instance) {
			instance
		}
	)
	# chart = .addClass(chart, "ePoints")
	chart

}

#' shiny output binding
#'
#' @export
corrplotOutput <- function(outputId, width = "100%", height = "400px") {
  htmlwidgets::shinyWidgetOutput(outputId, "corrplot", width, height, package = "bfdVis")
}

#' shiny output binding
#'
#' @export
renderCorrplot <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, corrplotOutput, env, quoted = TRUE)
}


#######
###
.orderListGenerate <- function (corr, orderList) ##使用base包中的rank函数来排序,返回一个list，包含各种算法计算出来的顺序。
{
	if (length(corr) == 1){
		returnList = list(original = matrix(1),
			AOE = matrix(1),
			FPC = matrix(1),
			name = matrix(1),
			hclust = matrix(1))
		return(returnList)
	}
    hclust.method <- "complete"

	returnList <- as.list(seq_along(orderList))# ??seq_along
	names(returnList) <- orderList
	### Original Order
	returnList$original <- seq_along(colnames(corr))


	#### AOE Order
	x.eigen <- eigen(corr)$vectors[, 1:2]
    e1 <- x.eigen[, 1]
    e2 <- x.eigen[, 2]
    alpha <- ifelse(e1 > 0, atan(e2/e1), atan(e2/e1) + pi)
    ord <- rank(alpha)
	returnList$AOE <- ord

	### FPC Oder
    x.eigen <- eigen(corr)$vectors[, 1:2]
    e1 <- x.eigen[, 1]
    ord <- rank(e1)
	returnList$FPC <- ord

	### name Order
    returnList$name <- as.vector(rank(rownames(corr)))

	### hclust Order
    returnList$hclust <- order(order.dendrogram(as.dendrogram(hclust(as.dist(1 -
            corr), method = hclust.method))))

    return(returnList)
}


#' shiny server launch shell function
#'
#' @export
runServer = function(displayMatrix){
	#
	save(displayMatrix, file=file.path(system.file("shinyApps",  package="bfdVis"), "displayMatrix.RData"))
	shiny::runApp(system.file("shinyApps", package="bfdVis"))
}











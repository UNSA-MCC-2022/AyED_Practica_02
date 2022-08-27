function alv_tree(am, w, h)
{
	this.init(am, w, h);
}

alv_tree.prototype = new Algorithm();
alv_tree.prototype.constructor = alv_tree;
alv_tree.superclass = Algorithm.prototype;

alv_tree.HIGHLIGHT_LABEL_COLOR = "#FF0000";
alv_tree.HIGHLIGHT_LINK_COLOR =  "#FF0000";
alv_tree.HIGHLIGHT_COLOR = "#007700";
alv_tree.HEIGHT_LABEL_COLOR = "#007700";
alv_tree.LINK_COLOR = "#000000";
alv_tree.HIGHLIGHT_CIRCLE_COLOR = "#007700";
alv_tree.FOREGROUND_COLOR = "#000000";
alv_tree.BACKGROUND_COLOR = "#FFFFFF";
alv_tree.PRINT_COLOR = alv_tree.FOREGROUND_COLOR;

alv_tree.ADJUSTING_HEIGHT_RECURSIVE = "Ajustando la altura luego de llamada recursiva";
alv_tree.UNWINDING_RECURSION = "Recursion";

alv_tree.WIDTH_DELTA = 50;
alv_tree.HEIGHT_DELTA = 50;
alv_tree.STARTING_Y = 50;

alv_tree.FIRST_PRINT_POS_X  = 50;
alv_tree.PRINT_VERTICAL_GAP  = 20;
alv_tree.PRINT_HORIZONTAL_GAP = 50;
alv_tree.EXPLANITORY_TEXT_X = 10;
alv_tree.EXPLANITORY_TEXT_Y = 10;


const CMD_CREATE_LABEL = "CreateLabel";
const CMD_CREATE_HIGHLIGHT_CIRCLE = "CreateHighlightCircle";
const CMD_SET_HIGHLIGHT = "SetHighlight";
const CMD_SET_FOREGROUND_COLOR = "SetForegroundColor";
const CMD_SET_BACKGROUND_COLOR = "SetBackgroundColor";
const CMD_SET_EDGE_HIGHLIGHT = "SetEdgeHighlight";
const CMD_CREATE_CIRCLE = "CreateCircle";
const CMD_MOVE = "Move";
const CMD_DELETE = "Delete";
const CMD_STEP = "Step";
const CMD_SET_TEXT = "SetText";
const CMD_DISCONNECT = "Disconnect";
const CMD_CONNECT = "Connect";


alv_tree.prototype.init = function(am, w, h)
{
	var sc = alv_tree.superclass;
	var fn = sc.init;
	this.first_print_pos_y  = h - 2 * alv_tree.PRINT_VERTICAL_GAP;
	this.print_max = w - 10;
	
	fn.call(this, am, w, h);
	this.startingX = w / 2;
	this.addControls();
	this.nextIndex = 1;
	this.commands = [];
	this.cmd(CMD_CREATE_LABEL, 0, "", alv_tree.EXPLANITORY_TEXT_X, alv_tree.EXPLANITORY_TEXT_Y, 0);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
}

alv_tree.prototype.addControls =  function()
{
	this.insertField = addControlToAlgorithmBar("Text", "");
	this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 4);
	this.insertButton = addControlToAlgorithmBar("Button", "Insertar");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.deleteField = addControlToAlgorithmBar("Text", "");
	this.deleteField.onkeydown = this.returnSubmit(this.deleteField,  this.deleteCallback.bind(this), 4);
	this.deleteButton = addControlToAlgorithmBar("Button", "Eliminar");
	this.deleteButton.onclick = this.deleteCallback.bind(this);
	this.findField = addControlToAlgorithmBar("Text", "");
	this.findField.onkeydown = this.returnSubmit(this.findField,  this.findCallback.bind(this), 4);
	this.findButton = addControlToAlgorithmBar("Button", "Buscar");
	this.findButton.onclick = this.findCallback.bind(this);
	// this.printButton = addControlToAlgorithmBar("Button", "Mostrar elementos");
	// this.printButton.onclick = this.printCallback.bind(this);

	this.insertField.classList.add("txtAlv");
	this.insertButton.classList.add("btnAlv");
	this.deleteField.classList.add("txtAlv");
	this.deleteButton.classList.add("btnAlv");
	this.findField.classList.add("txtAlv");
	this.findButton.classList.add("btnAlv");
}

alv_tree.prototype.reset = function()
{
	this.nextIndex = 1;
	this.treeRoot = null;
}

alv_tree.prototype.insertCallback = function(event)
{
	var insertedValue = this.insertField.value;
	insertedValue = this.normalizeNumber(insertedValue, 4);
	if (insertedValue != "")
	{
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this), insertedValue);
	}
}

alv_tree.prototype.deleteCallback = function(event)
{
	var deletedValue = this.deleteField.value;
	if (deletedValue != "")
	{
		deletedValue = this.normalizeNumber(deletedValue, 4);
		this.deleteField.value = "";
		this.implementAction(this.deleteElement.bind(this),deletedValue);		
	}
}

alv_tree.prototype.findCallback = function(event)
{
	var findValue = this.findField.value;
	if (findValue != "")
	{
		findValue = this.normalizeNumber(findValue, 4);
		this.findField.value = "";
		this.implementAction(this.findElement.bind(this),findValue);		
	}
}

alv_tree.prototype.printCallback = function(event)
{
	this.implementAction(this.printTree.bind(this),"");						
}

alv_tree.prototype.sizeChanged = function(newWidth, newHeight)
{
	this.startingX = newWidth / 2;
}	 
		
alv_tree.prototype.printTree = function(unused)
{
	this.commands = [];
	
	if (this.treeRoot != null)
	{
		this.highlightID = this.nextIndex++;
		var firstLabel = this.nextIndex;
		this.cmd(CMD_CREATE_HIGHLIGHT_CIRCLE, this.highlightID, alv_tree.HIGHLIGHT_COLOR, this.treeRoot.x, this.treeRoot.y);
		this.xPosOfNextLabel = alv_tree.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel = this.first_print_pos_y;
		this.printTreeRec(this.treeRoot);
		this.cmd(CMD_DELETE,this.highlightID);
		this.cmd(CMD_STEP);
		for (var i = firstLabel; i < this.nextIndex; i++)
			this.cmd(CMD_DELETE, i);
		this.nextIndex = this.highlightID;
	}
	return this.commands;
}

alv_tree.prototype.printTreeRec = function(tree) 
{
	this.cmd(CMD_STEP);
	if (tree.left != null)
	{
		this.cmd(CMD_MOVE, this.highlightID, tree.left.x, tree.left.y);
		this.printTreeRec(tree.left);
		this.cmd(CMD_MOVE, this.highlightID, tree.x, tree.y);				
		this.cmd(CMD_STEP);
	}
	var nextLabelID = this.nextIndex++;
	this.cmd(CMD_CREATE_LABEL, nextLabelID, tree.data, tree.x, tree.y);
	this.cmd(CMD_SET_FOREGROUND_COLOR, nextLabelID, alv_tree.PRINT_COLOR);
	this.cmd(CMD_MOVE, nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
	this.cmd(CMD_STEP);
	
	this.xPosOfNextLabel +=  alv_tree.PRINT_HORIZONTAL_GAP;
	if (this.xPosOfNextLabel > this.print_max)
	{
		this.xPosOfNextLabel = alv_tree.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel += alv_tree.PRINT_VERTICAL_GAP;
	}
	if (tree.right != null)
	{
		this.cmd(CMD_MOVE, this.highlightID, tree.right.x, tree.right.y);
		this.printTreeRec(tree.right);
		this.cmd(CMD_MOVE, this.highlightID, tree.x, tree.y);	
		this.cmd(CMD_STEP);
	}
	return;
}

alv_tree.prototype.findElement = function(findValue)
{
	this.commands = [];
	this.highlightID = this.nextIndex++;
	this.doFind(this.treeRoot, findValue);
	return this.commands;
}

alv_tree.prototype.doFind = function(tree, value)
{
	this.cmd(CMD_SET_TEXT, 0, "Searchiing for "+value);
	if (tree != null)
	{
		this.cmd(CMD_SET_HIGHLIGHT, tree.graphicID, 1);
		if (tree.data == value)
		{
			this.cmd(CMD_SET_TEXT, 0, "Buscar " + value + ": " + value + " = " + value + " (¡Elemento encontrado!)");
			this.cmd(CMD_STEP);
			this.cmd(CMD_SET_TEXT, 0, "Encontrado: " + value);
			this.cmd(CMD_SET_HIGHLIGHT, tree.graphicID, 0);
		}
		else
		{
			if (tree.data > value)
			{
				this.cmd(CMD_SET_TEXT, 0, " Buscando " + value + ": " + value + " < " + tree.data + " (Sub-arbol izquierdo)");
				this.cmd(CMD_STEP);
				this.cmd(CMD_SET_HIGHLIGHT, tree.graphicID, 0);
				if (tree.left!= null)
				{
					this.cmd(CMD_CREATE_HIGHLIGHT_CIRCLE, this.highlightID, alv_tree.HIGHLIGHT_COLOR, tree.x, tree.y);
					this.cmd(CMD_MOVE, this.highlightID, tree.left.x, tree.left.y);
					this.cmd(CMD_STEP);
					this.cmd(CMD_DELETE, this.highlightID);
				}
				this.doFind(tree.left, value);
			}
			else
			{
				this.cmd(CMD_SET_TEXT, 0, " Buscando " + value + ": " + value + " > " + tree.data + " (Sub-arbol derecho)");
				this.cmd(CMD_STEP);
				this.cmd(CMD_SET_HIGHLIGHT, tree.graphicID, 0);
				if (tree.right!= null)
				{
					this.cmd(CMD_CREATE_HIGHLIGHT_CIRCLE, this.highlightID, alv_tree.HIGHLIGHT_COLOR, tree.x, tree.y);
					this.cmd(CMD_MOVE, this.highlightID, tree.right.x, tree.right.y);
					this.cmd(CMD_STEP);
					this.cmd(CMD_DELETE, this.highlightID);				
				}
				this.doFind(tree.right, value);						
			}
		}
	}
	else
	{
		this.cmd(CMD_SET_TEXT, 0, " Buscando " + value + ": " + "<Arbol vacio> (Elemento no encontrado)");				
		this.cmd(CMD_STEP);					
		this.cmd(CMD_SET_TEXT, 0, " Buscando " + value + ": " + " (Elemento no encontrado)");
	}
}

alv_tree.prototype.insertElement = function(insertedValue)
{
	this.commands = [];	
	insertedValue = parseInt(insertedValue);
	this.cmd(CMD_SET_TEXT, 0, " Insertando " + insertedValue); 
	if (this.treeRoot == null)
	{
		var treeNodeID = this.nextIndex++;
		var labelID  = this.nextIndex++;
		this.cmd(CMD_CREATE_CIRCLE, treeNodeID, insertedValue,  this.startingX, alv_tree.STARTING_Y);
		this.cmd(CMD_SET_FOREGROUND_COLOR, treeNodeID, alv_tree.FOREGROUND_COLOR);
		this.cmd(CMD_SET_BACKGROUND_COLOR, treeNodeID, alv_tree.BACKGROUND_COLOR);
		this.cmd(CMD_CREATE_LABEL, labelID, 1,  this.startingX - 20, alv_tree.STARTING_Y-20);
		this.cmd(CMD_SET_FOREGROUND_COLOR, labelID, alv_tree.HEIGHT_LABEL_COLOR);
		this.cmd(CMD_STEP);				
		this.treeRoot = new AVLNode(insertedValue, treeNodeID, labelID, this.startingX, alv_tree.STARTING_Y);
		this.treeRoot.height = 1;
	}
	else
	{
		treeNodeID = this.nextIndex++;
		labelID = this.nextIndex++;
		this.highlightID = this.nextIndex++;
		
		this.cmd(CMD_CREATE_CIRCLE, treeNodeID, insertedValue, 30, alv_tree.STARTING_Y);

		this.cmd(CMD_SET_FOREGROUND_COLOR, treeNodeID, alv_tree.FOREGROUND_COLOR);
		this.cmd(CMD_SET_BACKGROUND_COLOR, treeNodeID, alv_tree.BACKGROUND_COLOR);
		this.cmd(CMD_CREATE_LABEL, labelID, "",  100-20, 100-20);
		this.cmd(CMD_SET_FOREGROUND_COLOR, labelID, alv_tree.HEIGHT_LABEL_COLOR);
		this.cmd(CMD_STEP);				
		var insertElem = new AVLNode(insertedValue, treeNodeID, labelID, 100, 100)
		
		this.cmd(CMD_SET_HIGHLIGHT, insertElem.graphicID, 1);
		insertElem.height = 1;
		this.insert(insertElem, this.treeRoot);
	}
	this.cmd(CMD_SET_TEXT, 0, " ");				
	return this.commands;
}

alv_tree.prototype.singleRotateRight = function(tree)
{
	var B = tree;
	var A = tree.left;
	var t2 = A.right;
	
	this.cmd(CMD_SET_TEXT, 0, "Single Rotate Right");
	this.cmd(CMD_SET_EDGE_HIGHLIGHT, B.graphicID, A.graphicID, 1);
	this.cmd(CMD_STEP);
	
	
	if (t2 != null)
	{
		this.cmd(CMD_DISCONNECT, A.graphicID, t2.graphicID);																		  
		this.cmd(CMD_CONNECT, B.graphicID, t2.graphicID, alv_tree.LINK_COLOR);
		t2.parent = B;
	}
	this.cmd(CMD_DISCONNECT, B.graphicID, A.graphicID);
	this.cmd(CMD_CONNECT, A.graphicID, B.graphicID, alv_tree.LINK_COLOR);
	A.parent = B.parent;
	if (this.treeRoot == B)
	{
		this.treeRoot = A;
	}
	else
	{
		this.cmd(CMD_DISCONNECT, B.parent.graphicID, B.graphicID, alv_tree.LINK_COLOR);
		this.cmd(CMD_CONNECT, B.parent.graphicID, A.graphicID, alv_tree.LINK_COLOR)
		if (B.isLeftChild())
		{
			B.parent.left = A;
		}
		else
		{
			B.parent.right = A;
		}
	}
	A.right = B;
	B.parent = A;
	B.left = t2;
	this. resetHeight(B);
	this. resetHeight(A);
	this.resizeTree();			
}

alv_tree.prototype.singleRotateLeft = function(tree)
{
	var A = tree;
	var B = tree.right;
	var t2 = B.left;
	
	this.cmd(CMD_SET_TEXT, 0, "Rotacion simple a la izquierda");
	this.cmd(CMD_SET_EDGE_HIGHLIGHT, A.graphicID, B.graphicID, 1);
	this.cmd(CMD_STEP);
	
	if (t2 != null)
	{
		this.cmd(CMD_DISCONNECT, B.graphicID, t2.graphicID);																		  
		this.cmd(CMD_CONNECT, A.graphicID, t2.graphicID, alv_tree.LINK_COLOR);
		t2.parent = A;
	}
	this.cmd(CMD_DISCONNECT, A.graphicID, B.graphicID);
	this.cmd(CMD_CONNECT, B.graphicID, A.graphicID, alv_tree.LINK_COLOR);
	B.parent = A.parent;
	if (this.treeRoot == A)
	{
		this.treeRoot = B;
	}
	else
	{
		this.cmd(CMD_DISCONNECT, A.parent.graphicID, A.graphicID, alv_tree.LINK_COLOR);
		this.cmd(CMD_CONNECT, A.parent.graphicID, B.graphicID, alv_tree.LINK_COLOR)
		
		if (A.isLeftChild())
		{
			A.parent.left = B;
		}
		else
		{
			A.parent.right = B;
		}
	}
	B.left = A;
	A.parent = B;
	A.right = t2;
	this.resetHeight(A);
	this.resetHeight(B);
	this.resizeTree();			
}

alv_tree.prototype.getHeight = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	return tree.height;
}

alv_tree.prototype.resetHeight = function(tree)
{
	if (tree != null)
	{
		var newHeight = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
		if (tree.height != newHeight)
		{
			tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1
			this.cmd(CMD_SET_TEXT,tree.heightLabelID, newHeight);
		}
	}
}

alv_tree.prototype.doubleRotateRight = function(tree)
{
	this.cmd(CMD_SET_TEXT, 0, "Rotacion doble a la derecha");
	var A = tree.left;
	var B = tree.left.right;
	var C = tree;
	var t2 = B.left;
	var t3 = B.right;
	
	this.cmd(CMD_DISCONNECT, C.graphicID, A.graphicID);
	this.cmd(CMD_DISCONNECT, A.graphicID, B.graphicID);
	this.cmd(CMD_CONNECT, C.graphicID, A.graphicID, alv_tree.HIGHLIGHT_LINK_COLOR);
	this.cmd(CMD_CONNECT, A.graphicID, B.graphicID, alv_tree.HIGHLIGHT_LINK_COLOR);
	this.cmd(CMD_STEP);
	
	if (t2 != null)
	{
		this.cmd(CMD_DISCONNECT,B.graphicID, t2.graphicID);
		t2.parent = A;
		A.right = t2;
		this.cmd(CMD_CONNECT, A.graphicID, t2.graphicID, alv_tree.LINK_COLOR);
	}
	if (t3 != null)
	{
		this.cmd(CMD_DISCONNECT,B.graphicID, t3.graphicID);
		t3.parent = C;
		C.left = t2;
		this.cmd(CMD_CONNECT, C.graphicID, t3.graphicID, alv_tree.LINK_COLOR);
	}
	if (C.parent == null)
	{
		B.parent = null;
		this.treeRoot = B;
	}
	else
	{
		this.cmd(CMD_DISCONNECT,C.parent.graphicID, C.graphicID);
		this.cmd(CMD_CONNECT,C.parent.graphicID, B.graphicID, alv_tree.LINK_COLOR);
		if (C.isLeftChild())
		{
			C.parent.left = B
		}
		else
		{
			C.parent.right = B;
		}
		B.parent = C.parent;
		C.parent = B;
	}
	this.cmd(CMD_DISCONNECT, C.graphicID, A.graphicID);
	this.cmd(CMD_DISCONNECT, A.graphicID, B.graphicID);
	this.cmd(CMD_CONNECT, B.graphicID, A.graphicID, alv_tree.LINK_COLOR);
	this.cmd(CMD_CONNECT, B.graphicID, C.graphicID, alv_tree.LINK_COLOR);
	B.left = A;
	A.parent = B;
	B.right = C;
	C.parent = B;
	A.right = t2;
	C.left = t3;
	this.resetHeight(A);
	this.resetHeight(C);
	this.resetHeight(B);
	this.resizeTree();
}

alv_tree.prototype.doubleRotateLeft = function(tree)
{
	this.cmd(CMD_SET_TEXT, 0, "Rotacion doble a la izquierda");
	var A = tree;
	var B = tree.right.left;
	var C = tree.right;
	var t1 = A.left;
	var t2 = B.left;
	var t3 = B.right;
	var t4 = C.right;
	
	this.cmd(CMD_DISCONNECT, A.graphicID, C.graphicID);
	this.cmd(CMD_DISCONNECT, C.graphicID, B.graphicID);
	this.cmd(CMD_CONNECT, A.graphicID, C.graphicID, alv_tree.HIGHLIGHT_LINK_COLOR);
	this.cmd(CMD_CONNECT, C.graphicID, B.graphicID, alv_tree.HIGHLIGHT_LINK_COLOR);
	this.cmd(CMD_STEP);
	
	if (t2 != null)
	{
		this.cmd(CMD_DISCONNECT,B.graphicID, t2.graphicID);
		t2.parent = A;
		A.right = t2;
		this.cmd(CMD_CONNECT, A.graphicID, t2.graphicID, alv_tree.LINK_COLOR);
	}
	if (t3 != null)
	{
		this.cmd(CMD_DISCONNECT,B.graphicID, t3.graphicID);
		t3.parent = C;
		C.left = t2;
		this.cmd(CMD_CONNECT, C.graphicID, t3.graphicID, alv_tree.LINK_COLOR);
	}
	
	if (A.parent == null)
	{
		B.parent = null;
		this.treeRoot = B;
	}
	else
	{
		this.cmd(CMD_DISCONNECT,A.parent.graphicID, A.graphicID);
		this.cmd(CMD_CONNECT,A.parent.graphicID, B.graphicID, alv_tree.LINK_COLOR);
		if (A.isLeftChild())
		{
			A.parent.left = B
		}
		else
		{
			A.parent.right = B;
		}
		B.parent = A.parent;
		A.parent = B;
	}
	this.cmd(CMD_DISCONNECT, A.graphicID, C.graphicID);
	this.cmd(CMD_DISCONNECT, C.graphicID, B.graphicID);
	this.cmd(CMD_CONNECT, B.graphicID, A.graphicID, alv_tree.LINK_COLOR);
	this.cmd(CMD_CONNECT, B.graphicID, C.graphicID, alv_tree.LINK_COLOR);
	B.left = A;
	A.parent = B;
	B.right = C;
	C.parent = B;
	A.right = t2;
	C.left = t3;
	this. resetHeight(A);
	this. resetHeight(C);
	this. resetHeight(B);
	this.resizeTree();
}

alv_tree.prototype.insert = function(elem, tree)
{
	this.cmd(CMD_SET_HIGHLIGHT, tree.graphicID, 1);
	this.cmd(CMD_SET_HIGHLIGHT, elem.graphicID, 1);
	
	if (elem.data < tree.data)
	{
		this.cmd(CMD_SET_TEXT, 0, elem.data + " < " + tree.data + ". Buscando en el sub-arbol izquierdo");				
	}
	else
	{
		this.cmd(CMD_SET_TEXT,  0, elem.data + " >= " + tree.data + ". Buscando en el sub-arbol derecho");				
	}
	this.cmd(CMD_STEP);
	this.cmd(CMD_SET_HIGHLIGHT, tree.graphicID , 0);
	this.cmd(CMD_SET_HIGHLIGHT, elem.graphicID, 0);
	
	if (elem.data < tree.data)
	{
		if (tree.left == null)
		{
			this.cmd(CMD_SET_TEXT, 0, "Arbol vacio, insertando elemento");				
			this.cmd(CMD_SET_TEXT,elem.heightLabelID,1); 
			
			this.cmd(CMD_SET_HIGHLIGHT, elem.graphicID, 0);
			tree.left=elem;
			elem.parent = tree;
			this.cmd(CMD_CONNECT, tree.graphicID, elem.graphicID, alv_tree.LINK_COLOR);
			
			this.resizeTree();
			this.cmd(CMD_CREATE_HIGHLIGHT_CIRCLE, this.highlightID, alv_tree.HIGHLIGHT_COLOR, tree.left.x, tree.left.y);
			this.cmd(CMD_MOVE, this.highlightID, tree.x, tree.y);
			this.cmd(CMD_SET_TEXT,  0, alv_tree.UNWINDING_RECURSION);
			this.cmd(CMD_STEP);
			this.cmd(CMD_DELETE, this.highlightID);
			
			if (tree.height < tree.left.height + 1)
			{
				tree.height = tree.left.height + 1;
				this.cmd(CMD_SET_TEXT, tree.heightLabelID, tree.height);
				this.cmd(CMD_SET_TEXT, 0, alv_tree.ADJUSTING_HEIGHT_RECURSIVE);
				this.cmd(CMD_SET_FOREGROUND_COLOR, tree.heightLabelID, alv_tree.HIGHLIGHT_LABEL_COLOR);
				this.cmd(CMD_STEP);
				this.cmd(CMD_SET_FOREGROUND_COLOR, tree.heightLabelID, alv_tree.HEIGHT_LABEL_COLOR);
			}
		}
		else
		{
			this.cmd(CMD_CREATE_HIGHLIGHT_CIRCLE, this.highlightID, alv_tree.HIGHLIGHT_COLOR, tree.x, tree.y);
			this.cmd(CMD_MOVE, this.highlightID, tree.left.x, tree.left.y);
			this.cmd(CMD_STEP);
			this.cmd(CMD_DELETE, this.highlightID);
			this.insert(elem, tree.left);
			this.cmd(CMD_CREATE_HIGHLIGHT_CIRCLE, this.highlightID, alv_tree.HIGHLIGHT_COLOR, tree.left.x, tree.left.y);
			this.cmd(CMD_MOVE, this.highlightID, tree.x, tree.y);
			this.cmd(CMD_SET_TEXT,  0, alv_tree.UNWINDING_RECURSION);
			this.cmd(CMD_STEP);
			this.cmd(CMD_DELETE, this.highlightID);
			
			if (tree.height < tree.left.height + 1)
			{
				tree.height = tree.left.height + 1
				this.cmd(CMD_SET_TEXT,tree.heightLabelID,tree.height); 
				this.cmd(CMD_SET_TEXT, 0, alv_tree.ADJUSTING_HEIGHT_RECURSIVE);
				this.cmd(CMD_SET_FOREGROUND_COLOR, tree.heightLabelID, alv_tree.HIGHLIGHT_LABEL_COLOR);
				this.cmd(CMD_STEP);
				this.cmd(CMD_SET_FOREGROUND_COLOR, tree.heightLabelID, alv_tree.HEIGHT_LABEL_COLOR);
				
			}
			if ((tree.right != null && tree.left.height > tree.right.height + 1) ||
				(tree.right == null && tree.left.height > 1))
			{
				if (elem.data < tree.left.data)
				{
					this.singleRotateRight(tree);
				}
				else
				{
					this.doubleRotateRight(tree);
				}
			}
		}
	}
	else
	{
		if (tree.right == null)
		{
			this.cmd(CMD_SET_TEXT,  0, "Arbol vacio, insertando elemento");
			this.cmd(CMD_SET_TEXT, elem.heightLabelID,1);
			this.cmd(CMD_SET_HIGHLIGHT, elem.graphicID, 0);
			tree.right=elem;
			elem.parent = tree;
			this.cmd(CMD_CONNECT, tree.graphicID, elem.graphicID, alv_tree.LINK_COLOR);
			elem.x = tree.x + alv_tree.WIDTH_DELTA/2;
			elem.y = tree.y + alv_tree.HEIGHT_DELTA
			this.cmd(CMD_MOVE, elem.graphicID, elem.x, elem.y);
			
			this.resizeTree();
			
			
			this.cmd(CMD_CREATE_HIGHLIGHT_CIRCLE, this.highlightID, alv_tree.HIGHLIGHT_COLOR, tree.right.x, tree.right.y);
			this.cmd(CMD_MOVE, this.highlightID, tree.x, tree.y);
			this.cmd(CMD_SET_TEXT, 0, alv_tree.UNWINDING_RECURSION);
			this.cmd(CMD_STEP);
			this.cmd(CMD_DELETE, this.highlightID);
			
			if (tree.height < tree.right.height + 1)
			{
				tree.height = tree.right.height + 1
				this.cmd(CMD_SET_TEXT,tree.heightLabelID,tree.height); 
				this.cmd(CMD_SET_TEXT, 0, alv_tree.ADJUSTING_HEIGHT_RECURSIVE);
				this.cmd(CMD_SET_FOREGROUND_COLOR, tree.heightLabelID, alv_tree.HIGHLIGHT_LABEL_COLOR);
				this.cmd(CMD_STEP);
				this.cmd(CMD_SET_FOREGROUND_COLOR, tree.heightLabelID, alv_tree.HEIGHT_LABEL_COLOR);						
			}
		}
		else
		{
			this.cmd(CMD_CREATE_HIGHLIGHT_CIRCLE, this.highlightID, alv_tree.HIGHLIGHT_COLOR, tree.x, tree.y);
			this.cmd(CMD_MOVE, this.highlightID, tree.right.x, tree.right.y);
			this.cmd(CMD_STEP);
			this.cmd(CMD_DELETE, this.highlightID);
			this.insert(elem, tree.right);
			this.cmd(CMD_CREATE_HIGHLIGHT_CIRCLE, this.highlightID, alv_tree.HIGHLIGHT_COLOR, tree.right.x, tree.right.y);
			this.cmd(CMD_MOVE, this.highlightID, tree.x, tree.y);
			this.cmd(CMD_SET_TEXT, 0, alv_tree.UNWINDING_RECURSION);			
			this.cmd(CMD_STEP);
			this.cmd(CMD_DELETE, this.highlightID);
			if (tree.height < tree.right.height + 1)
			{
				tree.height = tree.right.height + 1
				this.cmd(CMD_SET_TEXT,tree.heightLabelID,tree.height); 
				this.cmd(CMD_SET_TEXT, 0, alv_tree.ADJUSTING_HEIGHT_RECURSIVE);			
				this.cmd(CMD_SET_FOREGROUND_COLOR, tree.heightLabelID, alv_tree.HIGHLIGHT_LABEL_COLOR);
				this.cmd(CMD_STEP);
				this.cmd(CMD_SET_FOREGROUND_COLOR, tree.heightLabelID, alv_tree.HEIGHT_LABEL_COLOR);
			}
			if ((tree.left != null && tree.right.height > tree.left.height + 1) ||
				(tree.left == null && tree.right.height > 1))
			{
				if (elem.data >= tree.right.data)
				{
					this.singleRotateLeft(tree);
				}
				else
				{
					this.doubleRotateLeft(tree);
				}
			}
		}
	}
}

alv_tree.prototype.deleteElement = function(deletedValue)
{
	this.commands = [];
	this.cmd(CMD_SET_TEXT, 0, "Eliminando " + deletedValue);
	this.cmd(CMD_STEP);
	this.cmd(CMD_SET_TEXT, 0, " ");
	this.highlightID = this.nextIndex++;
	this.treeDelete(this.treeRoot, deletedValue);
	this.cmd(CMD_SET_TEXT, 0, " ");			
	return this.commands;						
}

alv_tree.prototype.treeDelete = function(tree, valueToDelete)
{
	var leftchild = false;
	if (tree != null)
	{
		if (tree.parent != null)
		{
			leftchild = tree.parent.left == tree;
		}
		this.cmd(CMD_SET_HIGHLIGHT, tree.graphicID, 1);
		if (valueToDelete < tree.data)
		{	
			this.cmd(CMD_SET_TEXT, 0, valueToDelete + " < " + tree.data + ". Buscando en sub-arbol izquierdo");				
		}
		else if (valueToDelete > tree.data)
		{
			this.cmd(CMD_SET_TEXT, 0, valueToDelete + " > " + tree.data + ". Buscando en sub-arbol derecho");				
		}
		else
		{
			this.cmd(CMD_SET_TEXT, 0, valueToDelete + " == " + tree.data + ". Nodo a eliminar encontrado");									
		}
		this.cmd(CMD_STEP);
		this.cmd(CMD_SET_HIGHLIGHT, tree.graphicID, 0);
		
		if (valueToDelete == tree.data)
		{
			if (tree.left == null && tree.right == null)
			{
				this.cmd(CMD_SET_TEXT,  0, "El nodo a eliminar es hijo, se puede borrar");									
				this.cmd(CMD_DELETE, tree.graphicID);
				this.cmd(CMD_DELETE, tree.heightLabelID);
				if (leftchild && tree.parent != null)
				{
					tree.parent.left = null;
				}
				else if (tree.parent != null)
				{
					tree.parent.right = null;
				}
				else
				{
					this.treeRoot = null;
				}
				this.resizeTree();				
				this.cmd(CMD_STEP);
				
			}
			else if (tree.left == null)
			{
				this.cmd(CMD_SET_TEXT, 0, "El nodo a eliminar no tiene hijos por la izquierda.  \nEstablecer el padre  Set parent of deleted node to right child of deleted node.");									
				if (tree.parent != null)
				{
					this.cmd(CMD_DISCONNECT, tree.parent.graphicID, tree.graphicID);
					this.cmd(CMD_CONNECT, tree.parent.graphicID, tree.right.graphicID, alv_tree.LINK_COLOR);
					this.cmd(CMD_STEP);
					this.cmd(CMD_DELETE, tree.graphicID);
					this.cmd(CMD_DELETE, tree.heightLabelID);
					if (leftchild)
					{
						tree.parent.left = tree.right;
					}
					else
					{
						tree.parent.right = tree.right;
					}
					tree.right.parent = tree.parent;
				}
				else
				{
					this.cmd(CMD_DELETE, tree.graphicID);
					this.cmd(CMD_DELETE, tree.heightLabelID);
					this.treeRoot = tree.right;
					this.treeRoot.parent = null;
				}
				this.resizeTree();				
			}
			else if (tree.right == null)
			{
				this.cmd(CMD_SET_TEXT,  0,"El nodo a eliminar no tiene hijo en la derecha.  \nEstablecer el padre del nodo eliminado al hijo izquierdo.");									
				if (tree.parent != null)
				{
					this.cmd(CMD_DISCONNECT, tree.parent.graphicID, tree.graphicID);
					this.cmd(CMD_CONNECT, tree.parent.graphicID, tree.left.graphicID, alv_tree.LINK_COLOR);
					this.cmd(CMD_STEP);
					this.cmd(CMD_DELETE, tree.graphicID);
					this.cmd(CMD_DELETE, tree.heightLabelID);
					if (leftchild)
					{
						tree.parent.left = tree.left;								
					}
					else
					{
						tree.parent.right = tree.left;
					}
					tree.left.parent = tree.parent;
				}
				else
				{
					this.cmd(CMD_DELETE , tree.graphicID);
					this.cmd(CMD_DELETE, tree.heightLabelID);
					this.treeRoot = tree.left;
					this.treeRoot.parent = null;
				}
				this.resizeTree();
			}
			else
			{
				this.cmd(CMD_SET_TEXT, 0, "El nodo a eliminar tiene dos hijos\nEncontrar el nodo mas grande en el sub-arbol izqueirdo.");
				
				this.highlightID = this.nextIndex;
				this.nextIndex += 1;
				this.cmd(CMD_CREATE_HIGHLIGHT_CIRCLE, this.highlightID, alv_tree.HIGHLIGHT_COLOR, tree.x, tree.y);
				var tmp = tree;
				tmp = tree.left;
				this.cmd(CMD_MOVE, this.highlightID, tmp.x, tmp.y);
				this.cmd(CMD_STEP);																									
				while (tmp.right != null)
				{
					tmp = tmp.right;
					this.cmd(CMD_MOVE, this.highlightID, tmp.x, tmp.y);
					this.cmd(CMD_STEP);																									
				}
				this.cmd(CMD_SET_TEXT, tree.graphicID, " ");
				var labelID = this.nextIndex;
				this.nextIndex += 1;
				this.cmd(CMD_CREATE_LABEL, labelID, tmp.data, tmp.x, tmp.y);
				this.cmd(CMD_SET_FOREGROUND_COLOR, labelID, alv_tree.HEIGHT_LABEL_COLOR);
				tree.data = tmp.data;
				this.cmd(CMD_MOVE, labelID, tree.x, tree.y);
				this.cmd(CMD_SET_TEXT, 0, "Copiar el valor mayor del sub-arbol izquierdo dentro del nodo a eliminar.");
				
				this.cmd(CMD_STEP);
				this.cmd(CMD_SET_HIGHLIGHT, tree.graphicID, 0);
				this.cmd(CMD_DELETE, labelID);
				this.cmd(CMD_SET_TEXT, tree.graphicID, tree.data);
				this.cmd(CMD_DELETE, this.highlightID);							
				this.cmd(CMD_SET_TEXT, 0, "Remover el nodo cuyo valor es copiado.");
				
				if (tmp.left == null)
				{
					if (tmp.parent != tree)
					{
						tmp.parent.right = null;
					}
					else
					{
						tree.left = null;
					}
					this.cmd(CMD_DELETE, tmp.graphicID);
					this.cmd(CMD_DELETE, tmp.heightLabelID);
					this.resizeTree();
				}
				else
				{
					this.cmd(CMD_DISCONNECT, tmp.parent.graphicID, tmp.graphicID);
					this.cmd(CMD_CONNECT, tmp.parent.graphicID, tmp.left.graphicID, alv_tree.LINK_COLOR);
					this.cmd(CMD_STEP);
					this.cmd(CMD_DELETE, tmp.graphicID);
					this.cmd(CMD_DELETE, tmp.heightLabelID);
					if (tmp.parent != tree)
					{
						tmp.parent.right = tmp.left;
						tmp.left.parent = tmp.parent;
					}
					else
					{
						tree.left = tmp.left;
						tmp.left.parent = tree;
					}
					this.resizeTree();
				}
				tmp = tmp.parent;
				
				if (this.getHeight(tmp) != Math.max(this.getHeight(tmp.left), this.getHeight(tmp.right)) + 1)
				{
					tmp.height = Math.max(this.getHeight(tmp.left), this.getHeight(tmp.right)) + 1
					this.cmd(CMD_SET_TEXT,tmp.heightLabelID,tmp.height); 
					this.cmd(CMD_SET_TEXT, 0, alv_tree.ADJUSTING_HEIGHT_RECURSIVE);
					this.cmd(CMD_SET_FOREGROUND_COLOR, tmp.heightLabelID, alv_tree.HIGHLIGHT_LABEL_COLOR);
					this.cmd(CMD_STEP);
					this.cmd(CMD_SET_FOREGROUND_COLOR, tmp.heightLabelID, alv_tree.HEIGHT_LABEL_COLOR);						
				}
			
				while (tmp != tree)
				{
					var tmpPar = tmp.parent;
					if (this.getHeight(tmp.left)- this.getHeight(tmp.right) > 1)
					{
						if (this.getHeight(tmp.left.right) > this.getHeight(tmp.left.left))
						{
							this.doubleRotateRight(tmp);
						}
						else
						{
							this.singleRotateRight(tmp);
						}
					}
					if (tmpPar.right != null)
					{
						if (tmpPar == tree)
						{
							this.cmd(CMD_CREATE_HIGHLIGHT_CIRCLE, this.highlightID, alv_tree.HIGHLIGHT_COLOR, tmpPar.left.x, tmpPar.left.y);
						}
						else
						{
							this.cmd(CMD_CREATE_HIGHLIGHT_CIRCLE, this.highlightID, alv_tree.HIGHLIGHT_COLOR, tmpPar.right.x, tmpPar.right.y);
						}
						this.cmd(CMD_MOVE, this.highlightID, tmpPar.x, tmpPar.y);
						this.cmd(CMD_SET_TEXT,  0, "Reservando ...");			
						
						if (this.getHeight(tmpPar) != Math.max(this.getHeight(tmpPar.left), this.getHeight(tmpPar.right)) + 1)
						{
							tmpPar.height = Math.max(this.getHeight(tmpPar.left), this.getHeight(tmpPar.right)) + 1
							this.cmd(CMD_SET_TEXT,tmpPar.heightLabelID,tree.height); 
							this.cmd(CMD_SET_TEXT, 0, alv_tree.ADJUSTING_HEIGHT_RECURSIVE);
							this.cmd(CMD_SET_FOREGROUND_COLOR, tmpPar.heightLabelID, alv_tree.HIGHLIGHT_LABEL_COLOR);
							this.cmd(CMD_STEP);
							this.cmd(CMD_SET_FOREGROUND_COLOR, tmpPar.heightLabelID, alv_tree.HEIGHT_LABEL_COLOR);						
						}
						this.cmd(CMD_STEP);
						this.cmd(CMD_DELETE, this.highlightID);
					}
					tmp = tmpPar;
				}
				if (this.getHeight(tree.right)- this.getHeight(tree.left) > 1)
				{
					if (this.getHeight(tree.right.left) > this.getHeight(tree.right.right))
					{
						this.doubleRotateLeft(tree);
					}
					else
					{
						this.singleRotateLeft(tree);
					}					
				}
				
			}
		}
		else if (valueToDelete < tree.data)
		{
			if (tree.left != null)
			{
				this.cmd(CMD_CREATE_HIGHLIGHT_CIRCLE, this.highlightID, alv_tree.HIGHLIGHT_COLOR, tree.x, tree.y);
				this.cmd(CMD_MOVE, this.highlightID, tree.left.x, tree.left.y);
				this.cmd(CMD_STEP);
				this.cmd(CMD_DELETE, this.highlightID);
			}
			this.treeDelete(tree.left, valueToDelete);
			if (tree.left != null)
			{
				this.cmd(CMD_SET_TEXT, 0, alv_tree.UNWINDING_RECURSION);
				this.cmd(CMD_CREATE_HIGHLIGHT_CIRCLE, this.highlightID, alv_tree.HIGHLIGHT_COLOR, tree.left.x, tree.left.y);
				this.cmd(CMD_MOVE, this.highlightID, tree.x, tree.y);
				this.cmd(CMD_STEP);
				this.cmd(CMD_DELETE, this.highlightID);
			}
			if (this.getHeight(tree.right)- this.getHeight(tree.left) > 1)
			{
				if (this.getHeight(tree.right.left) > this.getHeight(tree.right.right))
				{
					this.doubleRotateLeft(tree);
				}
				else
				{
					this.singleRotateLeft(tree);
				}					
			}
			if (this.getHeight(tree) != Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1)
			{
				tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1
				this.cmd(CMD_SET_TEXT,tree.heightLabelID,tree.height); 
				this.cmd(CMD_SET_TEXT, 0, alv_tree.ADJUSTING_HEIGHT_RECURSIVE);			
				this.cmd(CMD_SET_FOREGROUND_COLOR, tree.heightLabelID, alv_tree.HIGHLIGHT_LABEL_COLOR);
				this.cmd(CMD_STEP);
				this.cmd(CMD_SET_FOREGROUND_COLOR, tree.heightLabelID, alv_tree.HEIGHT_LABEL_COLOR);						
			}
		}
		else
		{
			if (tree.right != null)
			{
				this.cmd(CMD_CREATE_HIGHLIGHT_CIRCLE, this.highlightID, alv_tree.HIGHLIGHT_COLOR, tree.x, tree.y);
				this.cmd(CMD_MOVE, this.highlightID, tree.right.x, tree.right.y);
				this.cmd(CMD_STEP);
				this.cmd(CMD_DELETE, this.highlightID);
			}
			this.treeDelete(tree.right, valueToDelete);
			if (tree.right != null)
			{
				this.cmd(CMD_SET_TEXT, 0, alv_tree.UNWINDING_RECURSION);
				this.cmd(CMD_CREATE_HIGHLIGHT_CIRCLE, this.highlightID, alv_tree.HIGHLIGHT_COLOR, tree.right.x, tree.right.y);
				this.cmd(CMD_MOVE, this.highlightID, tree.x, tree.y);
				this.cmd(CMD_STEP);
				this.cmd(CMD_DELETE, this.highlightID);
			}
			
			
			if (this.getHeight(tree.left)- this.getHeight(tree.right) > 1)
			{
				if (this.getHeight(tree.left.right) > this.getHeight(tree.left.left))
				{
					this.doubleRotateRight(tree);
				}
				else
				{
					this.singleRotateRight(tree);
				}					
			}
			if (this.getHeight(tree) != Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1)
			{
				tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1
				this.cmd(CMD_SET_TEXT,tree.heightLabelID,tree.height); 
				this.cmd(CMD_SET_TEXT, 0, alv_tree.ADJUSTING_HEIGHT_RECURSIVE);			
				this.cmd(CMD_SET_FOREGROUND_COLOR, tree.heightLabelID, alv_tree.HIGHLIGHT_LABEL_COLOR);
				this.cmd(CMD_STEP);
				this.cmd(CMD_SET_FOREGROUND_COLOR, tree.heightLabelID, alv_tree.HEIGHT_LABEL_COLOR);						
			}
			
			
		}
	}
	else
	{
		this.cmd(CMD_SET_TEXT, 0, "Elemento " + valueToDelete + " no encontrado, no se puede eliminar");
	}
}

alv_tree.prototype.resizeTree = function()
{
	var startingPoint  = this.startingX;
	this.resizeWidths(this.treeRoot);
	if (this.treeRoot != null)
	{
		if (this.treeRoot.leftWidth > startingPoint)
		{
			startingPoint = this.treeRoot.leftWidth;
		}
		else if (this.treeRoot.rightWidth > startingPoint)
		{
			startingPoint = Math.max(this.treeRoot.leftWidth, 2 * startingPoint - this.treeRoot.rightWidth);
		}
		this.setNewPositions(this.treeRoot, startingPoint, alv_tree.STARTING_Y, 0);
		this.animateNewPositions(this.treeRoot);
		this.cmd(CMD_STEP);
	}
}

alv_tree.prototype.setNewPositions = function(tree, xPosition, yPosition, side)
{
	if (tree != null)
	{
		tree.y = yPosition;
		if (side == -1)
		{
			xPosition = xPosition - tree.rightWidth;
			tree.heightLabelX = xPosition - 20;
		}
		else if (side == 1)
		{
			xPosition = xPosition + tree.leftWidth;
			tree.heightLabelX = xPosition + 20;
		}
		else
		{
			tree.heightLabelX = xPosition - 20;
		}
		tree.x = xPosition;
		tree.heightLabelY = tree.y - 20;
		this.setNewPositions(tree.left, xPosition, yPosition + alv_tree.HEIGHT_DELTA, -1)
		this.setNewPositions(tree.right, xPosition, yPosition + alv_tree.HEIGHT_DELTA, 1)
	}
	
}
alv_tree.prototype.animateNewPositions = function(tree)
{
	if (tree != null)
	{
		this.cmd(CMD_MOVE, tree.graphicID, tree.x, tree.y);
		this.cmd(CMD_MOVE, tree.heightLabelID, tree.heightLabelX, tree.heightLabelY);
		this.animateNewPositions(tree.left);
		this.animateNewPositions(tree.right);
	}
}

alv_tree.prototype.resizeWidths = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	tree.leftWidth = Math.max(this.resizeWidths(tree.left), alv_tree.WIDTH_DELTA / 2);
	tree.rightWidth = Math.max(this.resizeWidths(tree.right), alv_tree.WIDTH_DELTA / 2);
	return tree.leftWidth + tree.rightWidth;
}


alv_tree.prototype.disableUI = function(event)
{
	this.insertField.disabled = true;
	this.insertButton.disabled = true;
	this.deleteField.disabled = true;
	this.deleteButton.disabled = true;
	this.findField.disabled = true;
	this.findButton.disabled = true;
	//this.printButton.disabled = true;
}

alv_tree.prototype.enableUI = function(event)
{
	this.insertField.disabled = false;
	this.insertButton.disabled = false;
	this.deleteField.disabled = false;
	this.deleteButton.disabled = false;
	this.findField.disabled = false;
	this.findButton.disabled = false;
	//this.printButton.disabled = false;
}
		
function AVLNode(val, id, hid, initialX, initialY)
{
	this.data = val;
	this.x = initialX;
	this.y = initialY;
	this.heightLabelID= hid;
	this.height = 1;
	
	this.graphicID = id;
	this.left = null;
	this.right = null;
	this.parent = null;
}
		
AVLNode.prototype.isLeftChild = function()		
{
	if (this. parent == null)
	{
		return true;
	}
	return this.parent.left == this;	
}

var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new alv_tree(animManag, canvas.width, canvas.height);
}

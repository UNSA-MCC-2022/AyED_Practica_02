/*
    C# - dotnet 6.0
    Programa que se ejecuta en Linux:
    Requisitos:
    - sudo apt install graphviz
    - sudo apt install feh

    Autor: FAF - Grupo 9

*/

class Program
{
    
    static void Main(string[] args)
    {        
        AVL tree = new AVL();

        int op= 0;
        int valor = 0;
        string comandoUnix = "";
        string resultado = "";
        do{
        menu();
        op = pedirOpcion();
        switch(op){
            case 1:                
                Console.WriteLine("\t->Ingrese valor: ");
                valor = Convert.ToInt32(Console.ReadLine());
                tree.Add(valor);

                tree.cadenaVector = "";
                tree.DisplayTree();   
                comandoUnix = "echo 'digraph {" + tree.cadenaVector + "'} | dot -Tsvg > faf_avl.svg";
                resultado = comandoLinux(comandoUnix);

                comandoUnix = "feh --magick-timeout 1 faf_avl.svg";
                resultado = comandoLinux(comandoUnix);
                
                break;
            case 2:
                Console.WriteLine("\t->Ingrese valor: ");
                valor = Convert.ToInt32(Console.ReadLine());
                tree.Delete(valor);
                break;
            case 3:             
                tree.cadenaVector = "";
                tree.DisplayTree();   
                comandoUnix = "echo 'digraph {" + tree.cadenaVector + "'} | dot -Tsvg > faf_avl.svg";
                resultado = comandoLinux(comandoUnix);

                comandoUnix = "feh --magick-timeout 1 faf_avl.svg";
                resultado = comandoLinux(comandoUnix);


                break;
            case 4:
                Console.WriteLine("\n\t->Adios!!!");
                break;
          }

        }while(op!=4);        
    }

    static int pedirOpcion(){
        int opcion;
        do{
                Console.Write("\t--->Digite opcion (1-4): ");
                opcion = Convert.ToInt32(Console.ReadLine());
                Console.WriteLine("\n\tOpcion: " + opcion);
                if(opcion<1||opcion>4)
                    Console.WriteLine("\t--->Error reingrese!!!");
            }while(opcion<1||opcion>4);
            return opcion;
    }

    static void menu(){
        Console.WriteLine("\t========MENU========");
        Console.WriteLine("\t1-> Agregar");
        Console.WriteLine("\t2-> Eliminar ");
        Console.WriteLine("\t3-> Mostrar");
        Console.WriteLine("\t4-> Exit ");
    }

    static string comandoLinux(string command)
    {
        //string command = "ls -l";
        string result = "";
        using (System.Diagnostics.Process proc = new System.Diagnostics.Process())
        {
            proc.StartInfo.FileName = "/bin/bash";
            proc.StartInfo.Arguments = "-c \" " + command + " \"";
            proc.StartInfo.UseShellExecute = false;
            proc.StartInfo.RedirectStandardOutput = true;
            proc.StartInfo.RedirectStandardError = true;
            proc.Start();

            result += proc.StandardOutput.ReadToEnd();
            result += proc.StandardError.ReadToEnd();

            proc.WaitForExit();
        }
        return result;
    }

}
class AVL
{
    class Node
    {
        public int data;
        public Node left;
        public Node right;
        public Node(int data)
        {
            this.data = data;
        }
    }
    Node root;
    public string cadenaVector = "";
    public AVL()
    {
    }
    public void Add(int data)
    {
        Node newItem = new Node(data);
        if (root == null)
        {
            root = newItem; 
        }
        else
        {
            root = RecursiveInsert(root, newItem);
        }
    }
    private Node RecursiveInsert(Node current, Node n)
    {
        if (current == null)
        {
            current = n;
            return current;
        }
        else if (n.data < current.data)
        {
            current.left = RecursiveInsert(current.left, n);
            current = balance_tree(current);
        }
        else if (n.data > current.data)
        {
            current.right = RecursiveInsert(current.right, n);
            current = balance_tree(current);
        }
        return current;
    }
    private Node balance_tree(Node current)
    {
        int b_factor = balance_factor(current);
        if (b_factor > 1)
        {
            if (balance_factor(current.left) > 0)
            {
                current = RotateLL(current);
            }
            else
            {
                current = RotateLR(current);
            }
        }
        else if (b_factor < -1)
        {
            if (balance_factor(current.right) > 0)
            {
                current = RotateRL(current);
            }
            else
            {
                current = RotateRR(current);
            }
        }
        return current;
    }
    public void Delete(int target)
    {//and here
        root = Delete(root, target);
    }
    private Node Delete(Node current, int target)
    {
        Node parent;
        if (current == null)
        { return null; }
        else
        {
            //left subtree
            if (target < current.data)
            {
                current.left = Delete(current.left, target);
                if (balance_factor(current) == -2)//here
                {
                    if (balance_factor(current.right) <= 0)
                    {
                        current = RotateRR(current);
                    }
                    else
                    {
                        current = RotateRL(current);
                    }
                }
            }
            //right subtree
            else if (target > current.data)
            {
                current.right = Delete(current.right, target);
                if (balance_factor(current) == 2)
                {
                    if (balance_factor(current.left) >= 0)
                    {
                        current = RotateLL(current);
                    }
                    else
                    {
                        current = RotateLR(current);
                    }
                }
            }
            //if target is found
            else
            {
                if (current.right != null)
                {
                    //delete its inorder successor
                    parent = current.right;
                    while (parent.left != null)
                    {
                        parent = parent.left;
                    }
                    current.data = parent.data;
                    current.right = Delete(current.right, parent.data);
                    if (balance_factor(current) == 2)//rebalancing
                    {
                        if (balance_factor(current.left) >= 0)
                        {
                            current = RotateLL(current);
                        }
                        else { current = RotateLR(current); }
                    }
                }
                else
                {   //if current.left != null
                    return current.left;
                }
            }
        }
        return current;
    }
    public void Find(int key)
    {
        if (Find(key, root).data == key)
        {
            Console.WriteLine("{0} was found!", key);
        }
        else
        {
            Console.WriteLine("Nothing found!");
        }
    }
    private Node Find(int target, Node current)
    {

            if (target < current.data)
            {
                if (target == current.data)
                {
                    return current;
                }
                else
                return Find(target, current.left);
            }
            else
            {
                if (target == current.data)
                {
                    return current;
                }
                else
                return Find(target, current.right);
            }
            
    }
    public void DisplayTree()
    {
        if (root == null)
        {
            Console.WriteLine("Tree is empty");
            return;
        }
        InOrderDisplayTree(root);
        Console.WriteLine();
    }
    private void InOrderDisplayTree(Node current)
    {
        if (current != null)
        {
            InOrderDisplayTree(current.left);
            /*Console.Write("({0}) <- ({1}) -> ({2}) | ", ((current.left != null) ? current.left.data : 0),
                                                        current.data,
                                                      ((current.right != null) ? current.right.data: 0) );*/
            if(current.left != null )
            {
                cadenaVector = cadenaVector + current.data.ToString() + " -> " + current.left.data.ToString() + ";";
                Console.Write("{0} -> {1} ; ", current.data, ((current.left != null) ? current.left.data : 0));
            }
            if(current.right != null)
            {
                cadenaVector = cadenaVector + current.data.ToString() + " -> " + current.right.data.ToString() + ";";
                Console.Write("{0} -> {1} ; ", current.data, ((current.right != null) ? current.right.data : 0));
            }
            
            InOrderDisplayTree(current.right);
        }
    }
    private int max(int l, int r)
    {
        return l > r ? l : r;
    }
    private int getHeight(Node current)
    {
        int height = 0;
        if (current != null)
        {
            int l = getHeight(current.left);
            int r = getHeight(current.right);
            int m = max(l, r);
            height = m + 1;
        }
        return height;
    }
    private int balance_factor(Node current)
    {
        int l = getHeight(current.left);
        int r = getHeight(current.right);
        int b_factor = l - r;
        return b_factor;
    }
    private Node RotateRR(Node parent)
    {
        Node pivot = parent.right;
        parent.right = pivot.left;
        pivot.left = parent;
        return pivot;
    }
    private Node RotateLL(Node parent)
    {
        Node pivot = parent.left;
        parent.left = pivot.right;
        pivot.right = parent;
        return pivot;
    }
    private Node RotateLR(Node parent)
    {
        Node pivot = parent.left;
        parent.left = RotateRR(pivot);
        return RotateLL(parent);
    }
    private Node RotateRL(Node parent)
    {
        Node pivot = parent.right;
        parent.right = RotateLL(pivot);
        return RotateRR(parent);
    }
}

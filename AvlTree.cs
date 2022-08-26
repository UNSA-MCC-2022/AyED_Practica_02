namespace TreeSearch
{
    public class AvlTree
    {
        class Node
        {
            public int Value { get; set; }
            public Node Left { get; set; }
            public Node Right { get; set; }

            public Node(int val)
            {
                Value = val;
            }
        }

        Node? root = null;

        public void Insert(int data)
        {
            Node newItem = new(data);
            if (root == null)
                root = newItem;
            else
                root = RecursiveInsert(root, newItem);
        }

        private Node RecursiveInsert(Node current, Node n)
        {
            if (current == null)
            {
                current = n;
                return current;
            }
            else if (n.Value < current.Value)
            {
                current.Left = RecursiveInsert(current.Left, n);
                current = BalanceTree(current);
            }
            else if (n.Value > current.Value)
            {
                current.Right = RecursiveInsert(current.Right, n);
                current = BalanceTree(current);
            }
            return current;
        }

        private Node BalanceTree(Node current)
        {
            int b_factor = BalanceFactor(current);
            if (b_factor > 1)
            {
                if (BalanceFactor(current.Left) > 0)
                    current = RotateLL(current);
                else
                    current = RotateLR(current);
            }
            else if (b_factor < -1)
            {
                if (BalanceFactor(current.Right) > 0)
                    current = RotateRL(current);
                else
                    current = RotateRR(current);
            }
            return current;
        }

        public void Delete(int target)
        {
            root = Delete(root, target);
        }

        private Node Delete(Node current, int target)
        {
            Node parent;
            if (current == null)
            {
                return null;
            }
            else
            {
                if (target < current.Value)
                {
                    current.Left = Delete(current.Left, target);
                    if (BalanceFactor(current) == -2)
                    {
                        if (BalanceFactor(current.Right) <= 0)
                            current = RotateRR(current);
                        else
                            current = RotateRL(current);
                    }
                }
                else if (target > current.Value)
                {
                    current.Right = Delete(current.Right, target);
                    if (BalanceFactor(current) == 2)
                    {
                        if (BalanceFactor(current.Left) >= 0)
                            current = RotateLL(current);
                        else
                            current = RotateLR(current);
                    }
                }
                else
                {
                    if (current.Right != null)
                    {
                        parent = current.Right;
                        while (parent.Left != null)
                        {
                            parent = parent.Left;
                        }
                        current.Value = parent.Value;
                        current.Right = Delete(current.Right, parent.Value);
                        if (BalanceFactor(current) == 2)
                        {
                            if (BalanceFactor(current.Left) >= 0)
                            {
                                current = RotateLL(current);
                            }
                            else { current = RotateLR(current); }
                        }
                    }
                    else
                    {
                        return current.Left;
                    }
                }
            }
            return current;
        }

        public void Find(int key)
        {
            if (Find(key, root).Value == key)
            {
                Console.WriteLine("{0} encontrado!", key);
            }
            else
            {
                Console.WriteLine("No encontrado");
            }
        }

        private Node Find(int target, Node current)
        {
            if (target < current.Value)
            {
                if (target == current.Value)
                    return current;
                else
                    return Find(target, current.Left);
            }
            else
            {
                if (target == current.Value)
                    return current;
                else
                    return Find(target, current.Right);
            }
        }

        public void DisplayTree()
        {
            if (root == null)
            {
                Console.WriteLine("Arbol vacio");
                return;
            }

            DisplayNodeTree(root, 0);
            Console.WriteLine();
        }

        private void DisplayNodeTree(Node current, int level)
        {
            if (current != null)
            {
                level++;
                DisplayNodeTree(current.Left, level);
                Console.WriteLine($" {level} -> {new string(' ', level * 4)}({current.Value})");
                DisplayNodeTree(current.Right, level);
            }
        }

        private int Max(int left, int right)
        {
            return left > right ? left : right;
        }

        private int GetHeight(Node current)
        {
            int height = 0;
            if (current != null)
            {
                int left = GetHeight(current.Left);
                int right = GetHeight(current.Right);
                int max = Max(left, right);
                height = max + 1;
            }
            return height;
        }

        private int BalanceFactor(Node current)
        {
            int left = GetHeight(current.Left);
            int right = GetHeight(current.Right);
            int balancefactor = left - right;
            return balancefactor;
        }

        private Node RotateRR(Node parent)
        {
            Node pivot = parent.Right;
            parent.Right = pivot.Left;
            pivot.Left = parent;
            return pivot;
        }

        private Node RotateLL(Node parent)
        {
            Node pivot = parent.Left;
            parent.Left = pivot.Right;
            pivot.Right = parent;
            return pivot;
        }
        private Node RotateLR(Node parent)
        {
            Node pivot = parent.Left;
            parent.Left = RotateRR(pivot);
            return RotateLL(parent);
        }

        private Node RotateRL(Node parent)
        {
            Node pivot = parent.Right;
            parent.Right = RotateLL(pivot);
            return RotateRR(parent);
        }
    }
}

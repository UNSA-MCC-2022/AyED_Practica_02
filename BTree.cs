namespace BTreeNamespace
{
    public class Entry<TreeKey, TreePointer> : IEquatable<Entry<TreeKey, TreePointer>>
    {
        public TreeKey Key { get; set; }
        public TreePointer Pointer { get; set; }

        public bool Equals(Entry<TreeKey, TreePointer> other)
        {
            return Key.Equals(other.Key) && Pointer.Equals(other.Pointer);
        }
    }

    public class Node<TreeKey, TreePointer>
    {
        private int _degree;

        public Node(int degree)
        {
            _degree = degree;
            Children = new List<Node<TreeKey, TreePointer>>(degree);
            Entries = new List<Entry<TreeKey, TreePointer>>(degree);
        }

        public List<Node<TreeKey, TreePointer>> Children { get; set; }

        public List<Entry<TreeKey, TreePointer>> Entries { get; set; }

        public bool IsLeaf
        {
            get
            {
                return Children.Count == 0;
            }
        }

        public bool HasReachedMaxEntries
        {
            get
            {
                return Entries.Count == (2 * _degree) - 1;
            }
        }

        public bool HasReachedMinEntries
        {
            get
            {
                return Entries.Count == _degree - 1;
            }
        }
    }

    public class BTree<TreeKey, TreePointer> where TreeKey : IComparable<TreeKey>
    {
        public Node<TreeKey, TreePointer> Root { get; private set; }
        public int Degree { get; private set; }
        public int Height { get; private set; }

        public BTree(int degree)
        {
            if (degree < 2)
            {
                throw new ArgumentException("El grado debe ser al menos dos", "degree");
            }

            Root = new Node<TreeKey, TreePointer>(degree);
            Degree = degree;
            Height = 1;
        }

        public Entry<TreeKey, TreePointer> Search(TreeKey key)
        {
            return SearchInternal(Root, key);
        }

        public void Insert(TreeKey newKey, TreePointer newPointer)
        {
            if (!Root.HasReachedMaxEntries)
            {
                InsertNonFull(Root, newKey, newPointer);
                return;
            }

            Node<TreeKey, TreePointer> oldRoot = Root;
            Root = new Node<TreeKey, TreePointer>(Degree);
            Root.Children.Add(oldRoot);
            SplitChild(Root, 0, oldRoot);
            InsertNonFull(Root, newKey, newPointer);

            Height++;
        }

        public void Delete(TreeKey keyToDelete)
        {
            DeleteInternal(Root, keyToDelete);

            if (Root.Entries.Count == 0 && !Root.IsLeaf)
            {
                Root = Root.Children.Single();
                Height--;
            }
        }

        private void DeleteInternal(Node<TreeKey, TreePointer> node, TreeKey keyToDelete)
        {
            int i = node.Entries.TakeWhile(entry => keyToDelete.CompareTo(entry.Key) > 0).Count();

            if (i < node.Entries.Count && node.Entries[i].Key.CompareTo(keyToDelete) == 0)
            {
                DeleteKeyFromNode(node, keyToDelete, i);
                return;
            }

            if (!node.IsLeaf)
            {
                DeleteKeyFromSubtree(node, keyToDelete, i);
            }
        }

        private void DeleteKeyFromSubtree(Node<TreeKey, TreePointer> parentNode, TreeKey keyToDelete, int subtreeIndexInNode)
        {
            Node<TreeKey, TreePointer> childNode = parentNode.Children[subtreeIndexInNode];

            if (childNode.HasReachedMinEntries)
            {
                int leftIndex = subtreeIndexInNode - 1;
                Node<TreeKey, TreePointer> leftSibling = subtreeIndexInNode > 0 ? parentNode.Children[leftIndex] : null;

                int rightIndex = subtreeIndexInNode + 1;
                Node<TreeKey, TreePointer> rightSibling = subtreeIndexInNode < parentNode.Children.Count - 1
                                                ? parentNode.Children[rightIndex]
                                                : null;

                if (leftSibling != null && leftSibling.Entries.Count > Degree - 1)
                {
                    childNode.Entries.Insert(0, parentNode.Entries[subtreeIndexInNode]);
                    parentNode.Entries[subtreeIndexInNode] = leftSibling.Entries.Last();
                    leftSibling.Entries.RemoveAt(leftSibling.Entries.Count - 1);

                    if (!leftSibling.IsLeaf)
                    {
                        childNode.Children.Insert(0, leftSibling.Children.Last());
                        leftSibling.Children.RemoveAt(leftSibling.Children.Count - 1);
                    }
                }
                else if (rightSibling != null && rightSibling.Entries.Count > Degree - 1)
                {
                    childNode.Entries.Add(parentNode.Entries[subtreeIndexInNode]);
                    parentNode.Entries[subtreeIndexInNode] = rightSibling.Entries.First();
                    rightSibling.Entries.RemoveAt(0);

                    if (!rightSibling.IsLeaf)
                    {
                        childNode.Children.Add(rightSibling.Children.First());
                        rightSibling.Children.RemoveAt(0);
                    }
                }
                else
                {
                    if (leftSibling != null)
                    {
                        childNode.Entries.Insert(0, parentNode.Entries[subtreeIndexInNode]);
                        var oldEntries = childNode.Entries;
                        childNode.Entries = leftSibling.Entries;
                        childNode.Entries.AddRange(oldEntries);
                        if (!leftSibling.IsLeaf)
                        {
                            var oldChildren = childNode.Children;
                            childNode.Children = leftSibling.Children;
                            childNode.Children.AddRange(oldChildren);
                        }

                        parentNode.Children.RemoveAt(leftIndex);
                        parentNode.Entries.RemoveAt(subtreeIndexInNode);
                    }
                    else
                    {
                        childNode.Entries.Add(parentNode.Entries[subtreeIndexInNode]);
                        childNode.Entries.AddRange(rightSibling.Entries);
                        if (!rightSibling.IsLeaf)
                        {
                            childNode.Children.AddRange(rightSibling.Children);
                        }

                        parentNode.Children.RemoveAt(rightIndex);
                        parentNode.Entries.RemoveAt(subtreeIndexInNode);
                    }
                }
            }

            DeleteInternal(childNode, keyToDelete);
        }

        private void DeleteKeyFromNode(Node<TreeKey, TreePointer> node, TreeKey keyToDelete, int keyIndexInNode)
        {
            if (node.IsLeaf)
            {
                node.Entries.RemoveAt(keyIndexInNode);
                return;
            }

            Node<TreeKey, TreePointer> predecessorChild = node.Children[keyIndexInNode];
            if (predecessorChild.Entries.Count >= Degree)
            {
                Entry<TreeKey, TreePointer> predecessor = DeletePredecessor(predecessorChild);
                node.Entries[keyIndexInNode] = predecessor;
            }
            else
            {
                Node<TreeKey, TreePointer> successorChild = node.Children[keyIndexInNode + 1];
                if (successorChild.Entries.Count >= Degree)
                {
                    Entry<TreeKey, TreePointer> successor = DeleteSuccessor(predecessorChild);
                    node.Entries[keyIndexInNode] = successor;
                }
                else
                {
                    predecessorChild.Entries.Add(node.Entries[keyIndexInNode]);
                    predecessorChild.Entries.AddRange(successorChild.Entries);
                    predecessorChild.Children.AddRange(successorChild.Children);

                    node.Entries.RemoveAt(keyIndexInNode);
                    node.Children.RemoveAt(keyIndexInNode + 1);

                    DeleteInternal(predecessorChild, keyToDelete);
                }
            }
        }

        private Entry<TreeKey, TreePointer> DeletePredecessor(Node<TreeKey, TreePointer> node)
        {
            if (node.IsLeaf)
            {
                var result = node.Entries[node.Entries.Count - 1];
                node.Entries.RemoveAt(node.Entries.Count - 1);
                return result;
            }

            return DeletePredecessor(node.Children.Last());
        }

        private Entry<TreeKey, TreePointer> DeleteSuccessor(Node<TreeKey, TreePointer> node)
        {
            if (node.IsLeaf)
            {
                var result = node.Entries[0];
                node.Entries.RemoveAt(0);
                return result;
            }

            return DeletePredecessor(node.Children.First());
        }

        private Entry<TreeKey, TreePointer> SearchInternal(Node<TreeKey, TreePointer> node, TreeKey key)
        {
            int i = node.Entries.TakeWhile(entry => key.CompareTo(entry.Key) > 0).Count();

            if (i < node.Entries.Count && node.Entries[i].Key.CompareTo(key) == 0)
            {
                return node.Entries[i];
            }

            return node.IsLeaf ? null : SearchInternal(node.Children[i], key);
        }

        private void SplitChild(Node<TreeKey, TreePointer> parentNode, int nodeToBeSplitIndex, Node<TreeKey, TreePointer> nodeToBeSplit)
        {
            var newNode = new Node<TreeKey, TreePointer>(Degree);

            parentNode.Entries.Insert(nodeToBeSplitIndex, nodeToBeSplit.Entries[Degree - 1]);
            parentNode.Children.Insert(nodeToBeSplitIndex + 1, newNode);

            newNode.Entries.AddRange(nodeToBeSplit.Entries.GetRange(Degree, Degree - 1));

            nodeToBeSplit.Entries.RemoveRange(Degree - 1, Degree);

            if (!nodeToBeSplit.IsLeaf)
            {
                newNode.Children.AddRange(nodeToBeSplit.Children.GetRange(Degree, Degree));
                nodeToBeSplit.Children.RemoveRange(Degree, Degree);
            }
        }

        private void InsertNonFull(Node<TreeKey, TreePointer> node, TreeKey newKey, TreePointer newPointer)
        {
            int positionToInsert = node.Entries.TakeWhile(entry => newKey.CompareTo(entry.Key) >= 0).Count();

            if (node.IsLeaf)
            {
                node.Entries.Insert(positionToInsert, new Entry<TreeKey, TreePointer>() { Key = newKey, Pointer = newPointer });
                return;
            }

            Node<TreeKey, TreePointer> child = node.Children[positionToInsert];
            if (child.HasReachedMaxEntries)
            {
                SplitChild(node, positionToInsert, child);
                if (newKey.CompareTo(node.Entries[positionToInsert].Key) > 0)
                {
                    positionToInsert++;
                }
            }

            InsertNonFull(node.Children[positionToInsert], newKey, newPointer);
        }
    }
}
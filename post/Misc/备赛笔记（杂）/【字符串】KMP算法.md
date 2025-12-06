# 题目

在一个文本 T 中寻找字符串 P 出现的位置，输出所有在 T 中找到的 P 的索引。T 的索引从 0 开始。

------

## 格式

### 输入格式：

1. 第一行给出一个文本 T；
2. 第二行给出一个字符串 P。

### 输出格式：

每行输出一个在 T 中找到的 P 的下标，以升序输出。

------

## 样例 1

### 输入：

```cpp
aabaaa
aa
```

### 输出：

```cpp
0
3
4
```

------

## 备注

- $1le∣T∣le1000000$
- $1le∣P∣lemin(∣T∣,10000)$
- 字符串只包含小写字母和数字，且一定能在 T 中找到 P。

# 思路

用$KMP$算法检索完整字串，如果完整则输出该字串开始的索引即可。

## $KMP$算法

其核心在于检查子串时如果不匹配不会返回当前串开始处全部重新检查，而是跳过能跳过的部分，以避免重新匹配。

主要分为两步：构建前缀数组和扫描字符串，时间复杂度为O（m+n)，其中m为模式串p的长度，n为需要扫描的字符串s的长度。步骤如下：

- 根据模式串构建next数组

  初始化`next[0]=0`，从1开始循环检查以i结束的字符串

# Code

```cpp
#include<bits/stdc++.h> 
using namespace std;

const int N=1e6+5;
string p,t;
bool notfirst=false;  //输出规划
int nxt[N]={0};     //前缀数组，表示最长相等前后缀的长度
int l,temp;     //字符串P的最大索引,

int main( )
{
    cin>>t>>p;
    //kmp计算next数组
    l=p.size()-1;     //字符串P的最大索引
    nxt[0]=0;
    int j=0;
    for(int i=1;i<=l;i++){
        while(j>0&&p[i]!=p[j])j=nxt[j-1];
        if(p[i]==p[j])j++;
        nxt[i]=j;
    }

    //遍历并输出
    int tind=0,pind=0;
    while(tind<t.size()){
        if(t[tind]==p[pind]&&pind==l){
            if(notfirst)cout<<"\\n";
            else notfirst=true;
            cout<<tind-l;
            pind=nxt[l];
            tind++;
        }
        else if(t[tind]==p[pind]){tind++;pind++;}
        else if(pind==0)tind++;
        else pind=nxt[pind-1];
    }
    return 0;
}
```